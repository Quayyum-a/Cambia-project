
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useZkLogin } from '../lib/zkLogin';

export default function Auth() {
  const [authMode, setAuthMode] = useState('traditional'); // 'traditional' or 'zklogin'
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
    isAuthenticated: zkAuthenticated, 
    user: zkUser, 
    signIn: zkSignIn, 
    handleCallback: zkHandleCallback 
  } = useZkLogin();

  useEffect(() => {
    // Check if this is a zkLogin callback
    const token = searchParams.get('token');
    const address = searchParams.get('address');
    const error = searchParams.get('error');

    if (token && address) {
      // Handle successful zkLogin callback
      handleZkLoginSuccess(token, address);
    } else if (error) {
      setError(decodeURIComponent(error));
    }
  }, [searchParams]);

  useEffect(() => {
    // If user is already authenticated with zkLogin, redirect
    if (zkAuthenticated && zkUser) {
      redirectBasedOnRole(zkUser.role);
    }
  }, [zkAuthenticated, zkUser]);

  const handleZkLoginSuccess = async (token, address) => {
    try {
      setLoading(true);
      const result = await zkHandleCallback(searchParams);
      redirectBasedOnRole(result.user.role);
    } catch (err) {
      setError('zkLogin authentication failed: ' + err.message);
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

  const handleZkLoginAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      await zkSignIn(window.location.origin + '/auth');
    } catch (err) {
      setError('zkLogin initialization failed: ' + err.message);
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
    setAuthMode(authMode === 'traditional' ? 'zklogin' : 'traditional');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {authMode === 'zklogin' 
              ? 'Sign in with Google (zkLogin)' 
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
                onClick={() => setAuthMode('zklogin')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  authMode === 'zklogin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Google zkLogin
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
