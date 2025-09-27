import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { demoVendors, featuredProducts, testimonials, stats, categories } from '../lib/demoData';
import { useZkLogin } from '../lib/zkLogin';

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useZkLogin();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/marketplace');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-green-600">
                Cambia
              </Link>
              <span className="ml-2 text-sm text-gray-500">🇳🇬</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/marketplace" className="text-gray-700 hover:text-green-600 transition-colors">
                Marketplace
              </Link>
              <Link to="/vendors" className="text-gray-700 hover:text-green-600 transition-colors">
                Vendors
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-green-600 transition-colors">
                About
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {user?.firstName || 'User'}</span>
                  <Link to="/sender" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/auth" className="text-gray-700 hover:text-green-600 transition-colors">
                    Sign In
                  </Link>
                  <button
                    onClick={handleGetStarted}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-orange-500 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Authentic Nigerian Products
              <br />
              <span className="text-orange-200">Delivered Worldwide</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover the rich flavors of Nigeria through our curated marketplace.
              From premium grains to fresh seafood, connect directly with trusted vendors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                {isAuthenticated ? 'Browse Marketplace' : 'Start Shopping'}
              </button>
              <Link
                to="/vendors"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-green-600 transition-colors"
              >
                Meet Our Vendors
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 fill-white">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalVendors}</div>
              <div className="text-gray-600">Trusted Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalProducts}+</div>
              <div className="text-gray-600">Quality Products</div>
            </div>
            <div className="text-center">
