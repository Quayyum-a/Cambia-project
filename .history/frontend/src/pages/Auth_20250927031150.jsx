import React, { useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        navigate('/marketplace');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
  };

  // Step 1: Choose Authentication Method
  if (currentStep === 'auth-method') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-6xl">🇳🇬</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Cambia</h2>
            <p className="text-gray-600">Choose how you'd like to sign up</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || zkLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => {
                setAuthMethod('email');
                setCurrentStep('wallet-question');
              }}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Sign up with Email
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Wallet Question
  if (currentStep === 'wallet-question') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-6xl">👛</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Do you have a Sui wallet?</h2>
            <p className="text-gray-600">We'll need this for secure blockchain transactions</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleWalletQuestion(true)}
              className="w-full bg-emerald-600 text-white py-4 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-lg"
            >
              Yes, I have a Sui wallet
            </button>

            <button
              onClick={() => handleWalletQuestion(false)}
              className="w-full border-2 border-emerald-600 text-emerald-600 py-4 px-4 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-lg"
            >
              No, create one for me
            </button>
          </div>

          <button
            onClick={goBack}
            className="w-full text-gray-600 hover:text-gray-800 py-2"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Wallet Address Form
  if (currentStep === 'wallet-form') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-6xl">🔑</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter your Sui wallet address</h2>
            <p className="text-gray-600">This will be used for secure transactions</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded animate-fade-in">
              {success}
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            if (formData.walletAddress.trim()) {
              setCurrentStep('register-form');
            } else {
              setError('Please enter a valid wallet address');
            }
          }}>
            <div className="space-y-4">
              <input
                name="walletAddress"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-center font-mono"
                placeholder="0x1234567890abcdef..."
                value={formData.walletAddress}
                onChange={handleInputChange}
              />
              <p className="text-sm text-gray-500 text-center">
                Your wallet address starts with "0x" and contains 40-66 characters
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Continue
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full text-gray-600 hover:text-gray-800 py-2"
              >
                ← Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 4: Registration Form
  if (currentStep === 'register-form') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-6xl">📝</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete your profile</h2>
            <p className="text-gray-600">Just a few more details to get started</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <input
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <select
                name="role"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="sender">Sender (Customer)</option>
                <option value="vendor">Vendor (Seller)</option>
                <option value="logistics">Logistics Provider</option>
              </select>

              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />

              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wallet Address:</span>
                  <span className="text-xs font-mono text-gray-800 bg-white px-2 py-1 rounded">
                    {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full text-gray-600 hover:text-gray-800 py-2"
              >
                ← Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

