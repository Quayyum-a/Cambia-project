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
                  <span className="text-2xl">�</span>
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

      {/* Featured Products - Revolutionary Design */}
      <section className="py-24 bg-gradient-to-b from-white to-emerald-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-amber-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent mb-6">
              Bestsellers This Week
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handpicked by our AI curator based on quality, freshness, and customer love
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {featuredProducts.slice(0, 3).map((product, index) => (
              <div
                key={product._id}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden border border-gray-100"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {product.isOnSale && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      🔥 HOT DEAL
                    </div>
                  )}

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <span className="text-sm font-bold ml-1 text-gray-900">{product.rating}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Link
                      to={`/product/${product._id}`}
                      className="w-full bg-white text-emerald-600 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors text-center block"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      {product.vendor}
                    </span>
                    <span className="text-xs text-gray-500">per {product.unit}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-emerald-600">
                        ₦{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₦{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              to="/marketplace"
              className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span>Explore All Products</span>
              <span className="ml-2 text-xl">🚀</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials - Revolutionary Design */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-amber-500/10"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Loved by Thousands
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real stories from real customers who've discovered Nigeria's culinary treasures
            </p>
          </div>

          {/* Testimonials Carousel */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                  {testimonials[currentTestimonial].image}
                </div>

                <blockquote className="text-2xl text-white mb-6 font-light leading-relaxed italic">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>

                <div className="flex items-center justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < testimonials[currentTestimonial].rating ? 'text-amber-400' : 'text-gray-600'}`}>
                      ⭐
                    </span>
                  ))}
                </div>

                <div className="text-lg text-emerald-300 font-semibold">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  {testimonials[currentTestimonial].location}
                </div>
                <div className="text-xs text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full inline-block">
                  Purchased: {testimonials[currentTestimonial].product}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full mx-2 transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-gradient-to-r from-emerald-400 to-amber-400 scale-125'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-400 mb-2">{stats.totalCustomers.toLocaleString()}+</div>
              <div className="text-gray-300">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-amber-400 mb-2">{stats.ordersProcessed.toLocaleString()}+</div>
              <div className="text-gray-300">Orders Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-cyan-400 mb-2">{stats.countriesServed}</div>
              <div className="text-gray-300">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-pink-400 mb-2">24/7</div>
              <div className="text-gray-300">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Revolutionary Design */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-amber-300/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-emerald-300/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-10 right-10 w-18 h-18 bg-cyan-300/20 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="mb-8">
            <span className="text-6xl md:text-8xl">🇳🇬</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Your Nigerian Adventure
            <br />
            <span className="text-2xl md:text-4xl font-light text-white/90">Starts Here</span>
          </h2>

          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-white/90 font-light">
            Join the revolution. Experience Nigeria's finest products with blockchain security,
            direct-from-source freshness, and worldwide delivery.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button
              onClick={handleGetStarted}
              className="group relative bg-white text-emerald-600 px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">🚀 Start Shopping Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="text-center">
              <div className="text-sm text-white/80 mb-1">Trusted by</div>
              <div className="flex items-center justify-center gap-4 text-white/60">
                <span className="font-semibold">45K+ Customers</span>
                <span>•</span>
                <span className="font-semibold">67 Countries</span>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-emerald-300 text-lg">🔒</span>
              <span>Blockchain Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-lg">⚡</span>
              <span>Instant Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 text-lg">🌍</span>
              <span>Global Shipping</span>
            </div>
          </div>
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