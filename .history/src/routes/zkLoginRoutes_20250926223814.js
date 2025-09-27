const router = require('express').Router();
const ZkLoginService = require('../services/zkLoginService');
const { authenticate } = require('../middlewares/auth');

const zkLoginService = new ZkLoginService();

/**
 * Initialize zkLogin flow - generate ephemeral keypair and nonce
 */
router.post('/init', async (req, res) => {
  try {
    const { redirectUrl } = req.body;
    
    // Generate ephemeral keypair and nonce
    const ephemeralData = zkLoginService.generateEphemeralKeypair();
    
    // Store ephemeral data in session/cache (in production, use Redis)
    const sessionId = require('crypto').randomUUID();

    // In production, store this in Redis with expiration
    global.zkLoginSessions = global.zkLoginSessions || {};
    global.zkLoginSessions[sessionId] = {
      ephemeralKeyPair: ephemeralData.ephemeralKeyPair,
      ephemeralPublicKey: ephemeralData.ephemeralPublicKey,
      nonce: ephemeralData.nonce,
      randomness: ephemeralData.randomness,
      ephemeralPrivateKey: ephemeralData.ephemeralPrivateKey,
      redirectUrl,
      createdAt: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    };
    
    // Generate Google OAuth URL
    const state = JSON.stringify({ sessionId, redirectUrl });
    const googleAuthUrl = zkLoginService.getGoogleAuthUrl(ephemeralData.nonce, state);
    
    res.json({
      success: true,
      data: {
        sessionId,
        nonce: ephemeralData.nonce,
        ephemeralPublicKey: ephemeralData.ephemeralPublicKey,
        googleAuthUrl
      }
    });
  } catch (error) {
    console.error('zkLogin init error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize zkLogin flow'
    });
  }
});

/**
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({
        success: false,
        error: 'Missing authorization code or state'
      });
    }
    
    const stateData = JSON.parse(state);
    const { sessionId, redirectUrl } = stateData;
    
    // Retrieve session data
    const sessionData = global.zkLoginSessions?.[sessionId];
    if (!sessionData || sessionData.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }
    
    // Exchange code for tokens
    const { tokens } = await zkLoginService.googleClient.getToken(code);
    const idToken = tokens.id_token;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'No ID token received from Google'
      });
    }
    
    // Verify Google token and extract user info
    const userInfo = await zkLoginService.verifyGoogleToken(idToken);
    
    // Verify nonce matches
    if (userInfo.nonce !== sessionData.nonce) {
      return res.status(400).json({
        success: false,
        error: 'Nonce mismatch'
      });
    }
    
    // Derive Sui address
    const suiAddress = await zkLoginService.deriveSuiAddress(userInfo);
    
    // Create or update user
    const userData = await zkLoginService.createOrUpdateZkLoginUser(userInfo, suiAddress);
    
    // Generate JWT token
    const jwtToken = zkLoginService.generateJwtToken(userData);
    
    // Clean up session
    delete global.zkLoginSessions[sessionId];
    
    // Redirect to frontend with token
    const frontendUrl = redirectUrl || 'http://localhost:3000';
    const redirectWithToken = `${frontendUrl}/auth/zklogin/success?token=${jwtToken}&address=${suiAddress}`;
    
    res.redirect(redirectWithToken);
  } catch (error) {
    console.error('Google callback error:', error);
    const errorUrl = req.query.state ? 
      JSON.parse(req.query.state).redirectUrl + '/auth/zklogin/error' : 
      'http://localhost:3000/auth/zklogin/error';
    res.redirect(`${errorUrl}?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Complete zkLogin authentication with proof
 */
router.post('/complete', async (req, res) => {
  try {
    const { sessionId, idToken, ephemeralPrivateKey } = req.body;
    
    // Retrieve session data
    const sessionData = global.zkLoginSessions?.[sessionId];
    if (!sessionData || sessionData.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }
    
    // Verify Google token
    const userInfo = await zkLoginService.verifyGoogleToken(idToken);
    
    // Generate zkLogin proof
    const ephemeralKeyPair = sessionData.ephemeralKeyPair;
    const proof = await zkLoginService.generateZkLoginProof(
      userInfo, 
      ephemeralKeyPair, 
      sessionData.randomness
    );
    
    // Derive Sui address
    const suiAddress = await zkLoginService.deriveSuiAddress(userInfo);
    
    // Create or update user
    const userData = await zkLoginService.createOrUpdateZkLoginUser(userInfo, suiAddress);
    
    // Generate JWT token
    const jwtToken = zkLoginService.generateJwtToken(userData);
    
    // Clean up session
    delete global.zkLoginSessions[sessionId];
    
    res.json({
      success: true,
      data: {
        token: jwtToken,
        user: {
          id: userData.googleSub,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          suiAddress: userData.suiAddress,
          profilePicture: userData.profilePicture,
          authMethod: 'zklogin'
        },
        zkLoginData: {
          suiAddress,
          proof: proof.proof,
          ephemeralPublicKey: sessionData.ephemeralPublicKey
        }
      }
    });
  } catch (error) {
    console.error('zkLogin complete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get zkLogin session status
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionData = global.zkLoginSessions?.[sessionId];
    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    if (sessionData.expiresAt < Date.now()) {
      delete global.zkLoginSessions[sessionId];
      return res.status(410).json({
        success: false,
        error: 'Session expired'
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId,
        nonce: sessionData.nonce,
        ephemeralPublicKey: sessionData.ephemeralPublicKey,
        expiresAt: sessionData.expiresAt,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Session status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session status'
    });
  }
});

/**
 * Validate zkLogin token
 */
router.post('/validate', authenticate, async (req, res) => {
  try {
    // If we reach here, the token is valid (authenticate middleware passed)
    res.json({
      success: true,
      data: {
        user: req.user,
        valid: true
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

/**
 * Get user's zkLogin profile
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    if (req.user.authMethod !== 'zklogin') {
      return res.status(400).json({
        success: false,
        error: 'Not a zkLogin user'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: req.user,
        suiAddress: req.user.suiAddress
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

module.exports = router;