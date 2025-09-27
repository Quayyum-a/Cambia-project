
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
        </form>
      </div>
    </div>
  );
}
