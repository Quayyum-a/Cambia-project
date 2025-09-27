import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useZkLogin } from '../lib/zkLogin';

export default function Auth() {
  const [authMode, setAuthMode] = useState('traditional'); // 'traditional' or 'google'
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    walletAddress: '',
    role: 'sender'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    zkLoginClient,
    isAuthenticated: googleAuthenticated,
    user: googleUser,
    signIn: googleSignIn,
    handleCallback: googleHandleCallback
  } = useZkLogin();

  useEffect(() => {
    // Check if this is a Google authentication callback
    const token = searchParams.get('token');
    const address = searchParams.get('address');
    const error = searchParams.get('error');

    if (token && address) {
      // Handle successful Google authentication callback
      handleGoogleAuthSuccess(token, address);
    } else if (error) {
      setError(decodeURIComponent(error));
    }
  }, [searchParams]);

  useEffect(() => {
    // If user is already authenticated with Google, redirect
    if (googleAuthenticated && googleUser) {
      redirectBasedOnRole(googleUser.role);
    }
  }, [googleAuthenticated, googleUser]);

  const handleGoogleAuthSuccess = async (token, address) => {
    try {
      setLoading(true);
      const result = await googleHandleCallback(searchParams);
      redirectBasedOnRole(result.user.role);
    } catch (err) {
      setError('Google authentication failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (userRole) => {
    switch (userRole) {
      case 'vendor':
        navigate('/vendor');
        break;
      case 'logistics':
        navigate('/logistics');
        break;
      case 'sender':
      default:
        navigate('/');
        break;
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTraditionalAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await api.post(endpoint, payload);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        redirectBasedOnRole(response.data.user.role);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');

      await googleSignIn(window.location.origin + '/auth');
    } catch (err) {
      setError('Google sign-in failed: ' + err.message);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      walletAddress: '',
      role: 'sender'
    });
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'traditional' ? 'google' : 'traditional');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {authMode === 'google'
              ? 'Sign in with Google'
              : (isLogin ? 'Sign in to Cambia' : 'Create your Cambia account')
            }
          </h2>
          
          {/* Auth Mode Toggle */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAuthMode('traditional')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  authMode === 'traditional'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Email & Password
              </button>
              <button
                onClick={() => setAuthMode('google')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  authMode === 'google'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Google Sign-In
              </button>
            </div>
          </div>

          {authMode === 'traditional' && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* zkLogin Authentication */}
        {authMode === 'zklogin' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center mb-4">
                <div className="text-4xl">🔐</div>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 text-center mb-2">
                Secure Authentication with zkLogin
              </h3>
              <p className="text-blue-700 text-sm text-center mb-4">
                Sign in with your Google account using zero-knowledge proofs. 
                Your privacy is protected while maintaining security.
              </p>
              <ul className="text-blue-600 text-xs space-y-1">
                <li>✓ No password required</li>
                <li>✓ Privacy-preserving authentication</li>
                <li>✓ Automatic Sui wallet generation</li>
                <li>✓ Secure blockchain integration</li>
              </ul>
            </div>

            <button
              onClick={handleZkLoginAuth}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Initializing...' : 'Continue with Google'}
              </div>
            </button>

            <div className="text-center">
              <button
                onClick={toggleAuthMode}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Use email and password instead
              </button>
            </div>
          </div>
        )}

        {/* Traditional Authentication */}
        {authMode === 'traditional' && (
          <form className="mt-8 space-y-6" onSubmit={handleTraditionalAuth}>
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="firstName"
                      type="text"
                      required
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                    <input
                      name="lastName"
                      type="text"
                      required
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <select
                    name="role"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="sender">Sender (Customer)</option>
                    <option value="vendor">Vendor (Seller)</option>
                    <option value="logistics">Logistics Provider</option>
                  </select>
                  
                  <input
                    name="walletAddress"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sui Wallet Address"
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                  />
                </>
              )}
              
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
              
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Try Google zkLogin instead
              </button>
            </div>
          </form>
        )}

        {/* zkLogin Success/Error Pages */}
        {(searchParams.get('token') || searchParams.get('error')) && (
          <div className="mt-8">
            {searchParams.get('token') ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <div className="flex items-center">
                  <div className="text-green-600 text-2xl mr-3">✅</div>
                  <div>
                    <h3 className="font-semibold">Authentication Successful!</h3>
                    <p className="text-sm">Redirecting to your dashboard...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex items-center">
                  <div className="text-red-600 text-2xl mr-3">❌</div>
                  <div>
                    <h3 className="font-semibold">Authentication Failed</h3>
                    <p className="text-sm">{searchParams.get('error')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Authentication Methods</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Traditional</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Email & password</li>
                <li>• Manual wallet setup</li>
                <li>• Standard security</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Google zkLogin</h4>
              <ul className="text-blue-600 space-y-1">
                <li>• Zero-knowledge proofs</li>
                <li>• Auto wallet generation</li>
                <li>• Enhanced privacy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
