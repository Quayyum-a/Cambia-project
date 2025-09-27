const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { generateNonce, generateRandomness, getExtendedEphemeralPublicKey } = require('@mysten/sui/zklogin');
const { SuiClient } = require('@mysten/sui/client');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

class ZkLoginService {
  constructor() {
    this.suiClient = new SuiClient({
      url: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
    });
    
    this.googleClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    });

    // Salt for zkLogin - should be stored securely in production
    this.salt = process.env.ZKLOGIN_SALT || 'cambia-zklogin-salt-2024';
  }

  /**
   * Generate ephemeral keypair and nonce for zkLogin flow
   */
  generateEphemeralKeypair() {
    try {
      const ephemeralKeyPair = new Ed25519Keypair();
      const ephemeralPrivateKey = ephemeralKeyPair.getSecretKey();
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();

      // Generate randomness for the nonce
      const randomness = generateRandomness();

      // Generate nonce - handle potential API changes
      let nonce;
      try {
        nonce = generateNonce(ephemeralPublicKey, randomness);
      } catch (error) {
        // Fallback: generate a simple nonce if the API has changed
        console.warn('generateNonce API changed, using fallback');
        const crypto = require('crypto');
        nonce = crypto.randomBytes(32).toString('base64');
      }

      return {
        ephemeralKeyPair,
        ephemeralPrivateKey: Array.from(ephemeralPrivateKey),
        ephemeralPublicKey: ephemeralPublicKey.toSuiPublicKey(),
        randomness: randomness.toString(),
        nonce
      };
    } catch (error) {
      console.error('Error generating ephemeral keypair:', error);
      throw new Error('Failed to generate ephemeral keypair for authentication');
    }
  }

  /**
   * Get Google OAuth URL for zkLogin
   */
  getGoogleAuthUrl(nonce, state) {
    const authUrl = this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state: state, // Include nonce and other data
      nonce: nonce,
      prompt: 'consent'
    });
    
    return authUrl;
  }

  /**
   * Verify Google JWT token and extract user info
   */
  async verifyGoogleToken(idToken) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      
      return {
        sub: payload.sub, // Google user ID
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
        aud: payload.aud,
        iss: payload.iss,
        iat: payload.iat,
        exp: payload.exp,
        nonce: payload.nonce
      };
    } catch (error) {
      throw new Error(`Google token verification failed: ${error.message}`);
    }
  }

  /**
   * Generate zkLogin proof (simplified - in production you'd use a proving service)
   */
  async generateZkLoginProof(userInfo, ephemeralKeyPair, randomness) {
    try {
      // In a real implementation, you would:
      // 1. Send the JWT to a proving service (like Mysten's prover)
      // 2. Get back a zero-knowledge proof
      // 3. Use that proof to create a zkLogin signature
      
      // For demo purposes, we'll create a mock proof structure
      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey());
      
      // This would normally come from the proving service
      const mockProof = {
        proofPoints: {
          a: ['0x1', '0x2'],
          b: [['0x3', '0x4'], ['0x5', '0x6']],
          c: ['0x7', '0x8']
        },
        issBase64Details: {
          value: Buffer.from(userInfo.iss).toString('base64'),
          indexMod4: 0
        },
        headerBase64: Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64')
      };

      return {
        proof: mockProof,
        extendedEphemeralPublicKey,
        userSalt: this.salt,
        addressSeed: this.generateAddressSeed(userInfo.sub)
      };
    } catch (error) {
      throw new Error(`zkLogin proof generation failed: ${error.message}`);
    }
  }

  /**
   * Generate address seed from user identifier
   */
  generateAddressSeed(userSub) {
    // Create a deterministic seed from user's Google sub and our salt
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(userSub + this.salt)
      .digest('hex');
  }

  /**
   * Derive Sui address from zkLogin proof
   */
  async deriveSuiAddress(userInfo) {
    try {
      const addressSeed = this.generateAddressSeed(userInfo.sub);
      
      // In a real implementation, you would derive the actual zkLogin address
      // For now, we'll create a deterministic address based on the user info
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256')
        .update(addressSeed + userInfo.aud)
        .digest('hex');
      
      // Format as Sui address (0x + 64 hex chars)
      const suiAddress = '0x' + hash.substring(0, 64);
      
      return suiAddress;
    } catch (error) {
      throw new Error(`Address derivation failed: ${error.message}`);
    }
  }

  /**
   * Create or update user with zkLogin data
   */
  async createOrUpdateZkLoginUser(userInfo, suiAddress) {
    // This would integrate with your user management system
    const userData = {
      googleSub: userInfo.sub,
      email: userInfo.email,
      firstName: userInfo.name?.split(' ')[0] || '',
      lastName: userInfo.name?.split(' ').slice(1).join(' ') || '',
      profilePicture: userInfo.picture,
      suiAddress: suiAddress,
      authMethod: 'zklogin',
      role: 'sender', // Default role
      emailVerified: userInfo.email_verified,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    return userData;
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateJwtToken(userData) {
    const payload = {
      id: userData.googleSub,
      email: userData.email,
      role: userData.role,
      authMethod: 'zklogin',
      suiAddress: userData.suiAddress
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'cambia-zklogin'
    });
  }

  /**
   * Validate zkLogin session
   */
  async validateZkLoginSession(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.authMethod !== 'zklogin') {
        throw new Error('Invalid auth method');
      }

      return decoded;
    } catch (error) {
      throw new Error(`Session validation failed: ${error.message}`);
    }
  }
}

module.exports = ZkLoginService;
