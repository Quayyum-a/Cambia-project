import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { demoVendors, featuredProducts, testimonials, stats, categories } from '../lib/demoData';

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                Cambia
              </Link>
              <span className="ml-2 text-lg">🇳🇬</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/marketplace" className="text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:scale-105">
                Marketplace
              </Link>
              <Link to="/vendors" className="text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:scale-105">
                Vendors
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-emerald-600 transition-all duration-300 hover:scale-105">
                About
              </Link>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Revolutionary Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-amber-300/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-emerald-300/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-cyan-300/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Main Content */}
        <div className={`relative z-10 text-center text-white max-w-6xl mx-auto px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Flag Animation */}
          <div className="mb-8 animate-pulse">
            <span className="text-8xl md:text-9xl">🇳🇬</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent animate-pulse">
              CAMBIA
            </span>
            <br />
            <span className="text-3xl md:text-5xl font-light text-white/90">
              The Future of African Commerce
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-white/90 font-light">
            Experience Nigeria's richest flavors through blockchain-powered trust.
            <span className="font-semibold text-amber-200"> Zero intermediaries. Maximum authenticity.</span>
            <br />
            From Lagos markets to your doorstep worldwide.
          </p>

          {/* Revolutionary CTA */}
          <div className="mb-16">
            <button
              onClick={handleGetStarted}
              className="group relative bg-white text-emerald-600 px-12 py-6 rounded-full font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">🚀 Start Your Journey</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 rounded-full border-4 border-white/30 group-hover:border-white/60 transition-colors duration-300"></div>
            </button>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>Blockchain Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>Direct from Farmers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>Global Shipping</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-black text-amber-300 mb-2">{stats.totalVendors}</div>
              <div className="text-sm font-medium text-white/90">Expert Vendors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-black text-amber-300 mb-2">{stats.totalProducts}+</div>
              <div className="text-sm font-medium text-white/90">Premium Products</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-black text-amber-300 mb-2">{stats.averageRating}★</div>
              <div className="text-sm font-medium text-white/90">Customer Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-black text-amber-300 mb-2">{stats.countriesServed}</div>
              <div className="text-sm font-medium text-white/90">Countries Served</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Innovation Showcase Section */}
      <section className="py-24 bg-gradient-to-r from-slate-50 to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-amber-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent mb-6">
              Why Choose Cambia?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another marketplace. We're revolutionizing African commerce with cutting-edge technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Blockchain Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Every transaction is secured by immutable blockchain technology. Your payments are protected by smart contracts, not promises.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-amber-100">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Direct from Source</h3>
              <p className="text-gray-600 leading-relaxed">
                Cut out middlemen and connect directly with Nigerian farmers and artisans. Maximum freshness, minimum markup.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-cyan-100">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered logistics and real-time tracking ensure your orders arrive fresh and on time, anywhere in the world.
              </p>
            </div>
          </div>

          {/* Interactive Categories Grid */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Universe</h3>
            <p className="text-gray-600">21 categories of authentic Nigerian excellence</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
            {categories.slice(0, 21).map((category, index) => (
              <Link
                key={category.id}
                to={`/marketplace?category=${category.id}`}
                className="group bg-white rounded-2xl p-6 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-amber-50 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100 hover:border-emerald-200"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium Nigerian products from trusted vendors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.isOnSale && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      SALE
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full shadow">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm ml-1">{product.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">₦{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₦{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">per {product.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{product.vendor}</span>
                    <Link
                      to={`/product/${product._id}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/marketplace"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Cambia Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience seamless shopping with our secure blockchain-powered marketplace.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Browse & Select</h3>
              <p className="text-gray-600">
                Explore authentic Nigerian products from verified vendors across different categories.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Secure Checkout</h3>
              <p className="text-gray-600">
                Pay securely with blockchain escrow. Your funds are protected until delivery.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Fast Delivery</h3>
              <p className="text-gray-600">
                Track your order in real-time. Fresh products delivered worldwide with care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers worldwide who trust Cambia for authentic Nigerian products.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="text-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
                <blockquote className="text-lg text-gray-900 mb-4 italic">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < testimonials[currentTestimonial].rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>{testimonials[currentTestimonial].name}</strong> from {testimonials[currentTestimonial].location}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Purchased: {testimonials[currentTestimonial].product}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    index === currentTestimonial ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Nigeria's Finest?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of customers worldwide who trust Cambia for authentic, fresh Nigerian products.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {isAuthenticated ? 'Continue Shopping' : 'Start Your Journey'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-green-400">Cambia</span>
                <span className="ml-2 text-sm">🇳🇬</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting the world to authentic Nigerian products through secure, transparent commerce.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><Link to="/marketplace" className="text-gray-400 hover:text-white">Marketplace</Link></li>
                <li><Link to="/vendors" className="text-gray-400 hover:text-white">Vendors</Link></li>
                <li><Link to="/categories" className="text-gray-400 hover:text-white">Categories</Link></li>
                <li><Link to="/deals" className="text-gray-400 hover:text-white">Special Deals</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link to="/shipping" className="text-gray-400 hover:text-white">Shipping Info</Link></li>
                <li><Link to="/returns" className="text-gray-400 hover:text-white">Returns</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/press" className="text-gray-400 hover:text-white">Press</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Cambia. All rights reserved. | Powered by Sui Blockchain
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
