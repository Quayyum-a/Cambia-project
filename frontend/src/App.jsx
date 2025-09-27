import React from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletConnect from './components/WalletConnect.jsx';
import { getSuiConfig } from './lib/sui.js';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = token && user.id;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'vendor':
        return <Navigate to="/vendor" replace />;
      case 'logistics':
        return <Navigate to="/logistics" replace />;
      case 'sender':
      default:
        return <Navigate to="/marketplace" replace />;
    }
  }

  return children;
}

// Public Route Component (redirects authenticated users)
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = token && user.id;

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'vendor':
        return <Navigate to="/vendor" replace />;
      case 'logistics':
        return <Navigate to="/logistics" replace />;
      case 'sender':
      default:
        return <Navigate to="/marketplace" replace />;
    }
  }

  return children;
}

export { ProtectedRoute, PublicRoute };

export default function App() {
  const [cfg, setCfg] = React.useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Create QueryClient for React Query
  const queryClient = new QueryClient();

  React.useEffect(() => { getSuiConfig().then(setCfg); }, []);

  // Check for authentication on app load and redirect if needed
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Only redirect from homepage if authenticated
    if (token && user.id && location.pathname === '/') {
      // Redirect authenticated users to their appropriate dashboard
      switch (user.role) {
        case 'vendor':
          navigate('/vendor');
          break;
        case 'logistics':
          navigate('/logistics');
          break;
        case 'sender':
        default:
          navigate('/marketplace');
          break;
      }
    }
  }, [navigate, location.pathname]);

  if (!cfg) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Cambia...</p>
      </div>
    </div>
  );

  const { network, url } = cfg;
  const { networkConfig } = createNetworkConfig({ [network]: { url } });

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = token && user.id;

  // Don't show navigation on homepage for unauthenticated users
  const showNavigation = location.pathname !== '/' || isAuthenticated;

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={network}>
        <WalletProvider autoConnect>
          <div className="min-h-screen bg-gray-50">
            {showNavigation && (
              <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="container">
                  <div className="flex justify-between h-16">
                    <div className="flex items-center">
                      <Link to="/" className="flex items-center space-x-3">
                        <span className="text-3xl">🇳🇬</span>
                        <span className="text-2xl font-bold text-emerald-600">Cambia</span>
                      </Link>

                      {isAuthenticated && (
                        <div className="ml-10 flex space-x-1">
                          {user.role === 'sender' && (
                            <>
                              <Link
                                to="/marketplace"
                                className={location.pathname === '/marketplace' ? 'nav-link nav-link-active' : 'nav-link nav-link-inactive'}
                              >
                                Marketplace
                              </Link>
                              <Link
                                to="/sender"
                                className={location.pathname === '/sender' ? 'nav-link nav-link-active' : 'nav-link nav-link-inactive'}
                              >
                                My Orders
                              </Link>
                            </>
                          )}

                          {user.role === 'vendor' && (
                            <Link
                              to="/vendor"
                              className={location.pathname === '/vendor' ? 'nav-link nav-link-active' : 'nav-link nav-link-inactive'}
                            >
                              Vendor Dashboard
                            </Link>
                          )}

                          {user.role === 'logistics' && (
                            <Link
                              to="/logistics"
                              className={location.pathname === '/logistics' ? 'nav-link nav-link-active' : 'nav-link nav-link-inactive'}
                            >
                              Logistics Portal
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-600">
                            Welcome, <span className="font-semibold text-gray-900">{user.firstName || user.email.split('@')[0]}</span>
                          </div>
                          <button
                            onClick={() => {
                              localStorage.removeItem('token');
                              localStorage.removeItem('user');
                              navigate('/');
                            }}
                            className="btn btn-ghost"
                          >
                            Sign Out
                          </button>
                          <WalletConnect />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <Link
                            to="/auth"
                            className="btn btn-primary"
                          >
                            Sign In
                          </Link>
                          <WalletConnect />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </nav>
            )}

            <main className={showNavigation ? 'py-8' : 'h-screen'}>
              <Outlet />
            </main>
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
