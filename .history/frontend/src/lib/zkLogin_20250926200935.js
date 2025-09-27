import React from 'react';
import { api } from './api';
import { generateNonce, generateRandomness, getExtendedEphemeralPublicKey } from '@mysten/sui/zklogin';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export class ZkLoginClient {
  constructor() {
    this.baseUrl = '/api/zklogin';
  }

  /**
   * Initialize zkLogin flow
   */
  async initializeZkLogin(redirectUrl = window.location.origin) {
    try {
      const response = await api.post(`${this.baseUrl}/init`, {
        redirectUrl
      });

      if (response.data.success) {
        const { sessionId, nonce, ephemeralPublicKey, googleAuthUrl } = response.data.data;
        
        // Store session data in localStorage
        localStorage.setItem('zklogin_session', JSON.stringify({
          sessionId,
          nonce,
          ephemeralPublicKey,
          redirectUrl,
          timestamp: Date.now()
        }));

        return {
          sessionId,
          nonce,
          ephemeralPublicKey,
          googleAuthUrl
        };
      } else {
        throw new Error(response.data.error || 'Failed to initialize zkLogin');
      }
    } catch (error) {
      console.error('zkLogin initialization error:', error);
      throw error;
    }
  }

  /**
   * Handle Google OAuth redirect
   */
  async handleGoogleCallback(urlParams) {
    try {
      const token = urlParams.get('token');
      const address = urlParams.get('address');
      const error = urlParams.get('error');

      if (error) {
        throw new Error(decodeURIComponent(error));
      }

      if (token && address) {
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('zklogin_address', address);
        
        // Get user data
        const userResponse = await api.get(`${this.baseUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userResponse.data.success) {
          const userData = userResponse.data.data.user;
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Clean up session data
          localStorage.removeItem('zklogin_session');
          
          return {
            token,
            address,
            user: userData
          };
        }
      }

      throw new Error('Invalid callback parameters');
    } catch (error) {
      console.error('Google callback error:', error);
      throw error;
    }
  }

  /**
   * Complete zkLogin authentication with proof
   */
  async completeZkLogin(idToken) {
    try {
      const sessionData = JSON.parse(localStorage.getItem('zklogin_session') || '{}');
      
      if (!sessionData.sessionId) {
        throw new Error('No active zkLogin session');
      }

      const response = await api.post(`${this.baseUrl}/complete`, {
        sessionId: sessionData.sessionId,
        idToken: idToken,
        ephemeralPrivateKey: sessionData.ephemeralPrivateKey
      });

      if (response.data.success) {
        const { token, user, zkLoginData } = response.data.data;
        
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('zklogin_data', JSON.stringify(zkLoginData));
        
        // Clean up session data
        localStorage.removeItem('zklogin_session');
        
        return {
          token,
          user,
          zkLoginData
        };
      } else {
        throw new Error(response.data.error || 'Failed to complete zkLogin');
      }
    } catch (error) {
      console.error('zkLogin completion error:', error);
      throw error;
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId) {
    try {
      const response = await api.get(`${this.baseUrl}/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Session status error:', error);
      throw error;
    }
  }

  /**
   * Validate current zkLogin token
   */
  async validateToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { valid: false, error: 'No token found' };
      }

      const response = await api.post(`${this.baseUrl}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get zkLogin user profile
   */
  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await api.get(`${this.baseUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Profile error:', error);
      throw error;
    }
  }

  /**
   * Sign out and clear zkLogin data
   */
  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('zklogin_data');
    localStorage.removeItem('zklogin_address');
    localStorage.removeItem('zklogin_session');
  }

  /**
   * Check if user is authenticated with zkLogin
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }

    try {
      const userData = JSON.parse(user);
      return userData.authMethod === 'zklogin';
    } catch {
      return false;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get zkLogin address
   */
  getZkLoginAddress() {
    return localStorage.getItem('zklogin_address');
  }

  /**
   * Get zkLogin data
   */
  getZkLoginData() {
    try {
      const data = localStorage.getItem('zklogin_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}

// React hooks for zkLogin
export function useZkLogin() {
  const [zkLoginClient] = React.useState(() => new ZkLoginClient());
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = zkLoginClient.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const userData = zkLoginClient.getCurrentUser();
          setUser(userData);
          
          // Validate token
          const validation = await zkLoginClient.validateToken();
          if (!validation.valid) {
            zkLoginClient.signOut();
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        zkLoginClient.signOut();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [zkLoginClient]);

  const signIn = async (redirectUrl) => {
    try {
      setLoading(true);
      const initData = await zkLoginClient.initializeZkLogin(redirectUrl);
      
      // Redirect to Google OAuth
      window.location.href = initData.googleAuthUrl;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = () => {
    zkLoginClient.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleCallback = async (urlParams) => {
    try {
      setLoading(true);
      const result = await zkLoginClient.handleGoogleCallback(urlParams);
      setIsAuthenticated(true);
      setUser(result.user);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    zkLoginClient,
    isAuthenticated,
    user,
    loading,
    signIn,
    signOut,
    handleCallback
  };
}

export default ZkLoginClient;