import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletConnect from './components/WalletConnect.jsx';
import { getSuiConfig } from './lib/sui.js';

// Create a client
const queryClient = new QueryClient();

export default function App() {
  const [cfg, setCfg] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getSuiConfig().then(setCfg);
    
    // Check for logged in user
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    navigate('/auth');
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { to: '/', label: 'Marketplace', icon: '🏪' },
        { to: '/auth', label: 'Sign In', icon: '👤' }
      ];
    }

    const baseLinks = [
      { to: '/', label: 'Marketplace', icon: '🏪' }
    ];

    switch (user.role) {
      case 'sender':
        return [
          ...baseLinks,
          { to: '/sender', label: 'My Dashboard', icon: '📱' },
          { to: '/checkout', label: 'Checkout', icon: '🛒' }
        ];
      case 'vendor':
        return [
          ...baseLinks,
          { to: '/vendor', label: 'Vendor Dashboard', icon: '🏬' }
        ];
      case 'logistics':
        return [
          ...baseLinks,
          { to: '/logistics', label: 'Logistics Portal', icon: '🚚' }
        ];
      default:
        return baseLinks;
    }
  };

  if (!cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Cambia...</p>
        </div>
      </div>
    );
  }

  const { network, url } = cfg;
  const { networkConfig } = createNetworkConfig({ [network]: { url } });

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={network}>
        <WalletProvider autoConnect>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Header */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <Link to="/" className="flex items-center space-x-2">
                    <div className="text-2xl">🌍</div>
                    <span className="text-xl font-bold text-gray-900">Cambia</span>
                  </Link>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                  {getNavLinks().map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === link.to
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Right side - Wallet & User */}
                <div className="flex items-center space-x-4">
                  <WalletConnect />
                  
                  {user ? (
                    <div className="flex items-center space-x-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-gray-500 capitalize">{user.role}</div>
                      </div>
                      <button
                        onClick={logout}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {getNavLinks().map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === link.to
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet context={{ user, setUser }} />
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="text-2xl">🌍</div>
                    <span className="text-xl font-bold text-gray-900">Cambia</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Connecting the Nigerian diaspora with authentic food products through secure blockchain-powered transactions.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">For Customers</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link to="/" className="hover:text-gray-900">Browse Products</Link></li>
                    <li><Link to="/auth" className="hover:text-gray-900">Create Account</Link></li>
                    <li><a href="#" className="hover:text-gray-900">Track Orders</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">For Vendors</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link to="/auth" className="hover:text-gray-900">Vendor Signup</Link></li>
                    <li><a href="#" className="hover:text-gray-900">Seller Guide</a></li>
                    <li><a href="#" className="hover:text-gray-900">Support</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-500">
                  © 2024 Cambia. Powered by Sui blockchain technology.
                </p>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <span className="text-sm text-gray-500">Secured by</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-600 font-semibold">SUI</span>
                    <span className="text-sm text-gray-500">blockchain</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

