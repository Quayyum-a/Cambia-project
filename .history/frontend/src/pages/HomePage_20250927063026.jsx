import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.id) {
      // Redirect to appropriate dashboard
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
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-amber-200 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-200 rounded-full opacity-20 animate-float"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Nigerian Flag */}
            <div className="inline-flex items-center justify-center w-24 h-16 bg-green-600 relative mb-8 rounded-lg shadow-lg">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-green-600"></div>
              <div className="absolute left-8 top-0 bottom-0 w-8 bg-white"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-green-600"></div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to
              <span className="block text-emerald-600">Cambia</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              The future of African commerce. Connect with trusted vendors, experience secure blockchain payments, and discover authentic Nigerian products from farm to table.
            </p>

            {/* Single CTA Button */}
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10">🚀 Get Started</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Secure</h3>
                <p className="text-gray-600">Every transaction protected by Sui blockchain technology</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌾</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct from Farmers</h3>
                <p className="text-gray-600">Authentic Nigerian products sourced directly from local producers</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Logistics</h3>
                <p className="text-gray-600">Smart delivery optimization powered by artificial intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">17</div>
              <div className="text-gray-600">Trusted Vendors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-gray-600">Authentic Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">45K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">4.7★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Preview */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Discover the best of Nigerian cuisine and produce</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-6xl">🥜</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Groundnuts</h3>
                <p className="text-gray-600 mb-4">Fresh, locally sourced groundnuts perfect for snacks and cooking</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-600">₦2,500</span>
                  <span className="text-sm text-gray-500">per kg</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <span className="text-6xl">🌶️</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nigerian Peppers</h3>
                <p className="text-gray-600 mb-4">Authentic scotch bonnet peppers for that perfect Nigerian heat</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-600">₦1,800</span>
                  <span className="text-sm text-gray-500">per bunch</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-6xl">🥬</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Ugwu Leaves</h3>
                <p className="text-gray-600 mb-4">Tender pumpkin leaves, essential for authentic Nigerian soups</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-600">₦800</span>
                  <span className="text-sm text-gray-500">per bunch</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-3 text-lg font-medium text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors duration-300"
            >
              Explore All Products
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl mr-2">🇳🇬</span>
              <span className="text-2xl font-bold">Cambia</span>
            </div>
            <p className="text-gray-400 mb-4">Revolutionizing African commerce with blockchain technology</p>
            <p className="text-sm text-gray-500">© 2024 Cambia. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #000 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}