import React, { useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContainer.jsx';

export default function Auth({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const validateForm = () => {
    if (!email.trim()) return 'Email is required';
    if (!password.trim()) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 16) return 'Password must be no more than 16 characters';
    if (!isLogin && !email.includes('@')) return 'Please enter a valid email address';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email, password }
        : {
            email,
            password,
            firstName: 'Demo',
            lastName: 'User',
            walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            role: 'sender'
          };

      const response = await api.post(endpoint, payload);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        showSuccess(`Welcome back, ${response.data.user.firstName || response.data.user.email.split('@')[0]}!`);
        navigate('/marketplace');
        return;
      }

      if (!isLogin && (response.data?.status === true || response.status === 201)) {
        showSuccess('Registration successful! Please sign in with your credentials.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Authentication failed';
      showError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {isLogin ? '' : <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  email && !email.includes('@') ? 'border-red-300 focus:ring-red-500' :
                  email && email.includes('@') ? 'border-green-300 focus:ring-green-500' :
                  'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(8-16 characters)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-12 transition-colors ${
                    password && (password.length < 8 || password.length > 16) ? 'border-red-300 focus:ring-red-500' :
                    password && password.length >= 8 && password.length <= 16 ? 'border-green-300 focus:ring-green-500' :
                    'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>

            {isLogin && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('quayyumariyo@gmail.com');
                    setPassword('monkeyss');
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      form && form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }, 0);
                  }}
                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 font-medium"
                >
                  🚀 Quick Demo Login (Sender)
                </button>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setEmail('vendor@cambia.com');
                      setPassword('vendor123');
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        form && form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }, 0);
                    }}
                    className="w-full border border-orange-600 text-orange-600 py-2 px-4 rounded-md hover:bg-orange-50 font-medium text-sm"
                  >
                    🏪 Vendor Demo
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setEmail('logistics@cambia.com');
                      setPassword('logistics123');
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        form && form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }, 0);
                    }}
                    className="w-full border border-purple-600 text-purple-600 py-2 px-4 rounded-md hover:bg-purple-50 font-medium text-sm"
                  >
                    🚚 Logistics Demo
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {isLogin && (
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Demo Accounts</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Sender:</strong> quayyumariyo@gmail.com / monkeyss</p>
              <p><strong>Vendor:</strong> vendor@cambia.com / vendor123</p>
              <p><strong>Logistics:</strong> logistics@cambia.com / logistics123</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              All demo accounts work offline without external services
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
