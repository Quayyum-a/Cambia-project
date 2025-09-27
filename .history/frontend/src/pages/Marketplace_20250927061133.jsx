import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { demoVendors, demoProducts, categories } from '../lib/demoData';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load all products initially
    setProducts(demoProducts);
    setFilteredProducts(demoProducts);

    // Check for category filter from URL
    const category = searchParams.get('category');
    if (category && category !== 'all') {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const loadVendorProducts = async (vendorId) => {
    setLoading(true);
    try {
      // In demo mode, filter from demo data
      const vendorProducts = demoProducts.filter(p => p.vendorId === vendorId);
      setProducts(vendorProducts);
      setSelectedVendor(vendorId);
    } catch (error) {
      console.error('Error loading vendor products:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    setProducts(demoProducts);
    setSelectedVendor(null);
  };

  const addToCart = (product) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/auth');
      return;
    }

    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, vendorId: selectedVendor }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.product._id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    // Store cart in localStorage for checkout page
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= Number(priceRange.max));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">Cambia Marketplace</h1>
            <p className="page-subtitle">Discover authentic Nigerian products from trusted vendors</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  placeholder="Search by name, description..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₦)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Vendor Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Browse by Vendor
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={selectedVendor || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      loadVendorProducts(e.target.value);
                    } else {
                      setProducts(demoProducts);
                      setSelectedVendor(null);
                    }
                  }}
                >
                  <option value="">All Vendors</option>
                  {demoVendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedVendor ? `${demoVendors.find(v => v.id === selectedVendor)?.name} Products` : 'All Products'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                {selectedVendor && (
                  <button
                    onClick={() => {
                      setProducts(demoProducts);
                      setSelectedVendor(null);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Show All Products
                  </button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all products.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
                      <div className="mb-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          product.category === 'seafood' ? 'bg-blue-100 text-blue-800' :
                          product.category === 'spices' ? 'bg-yellow-100 text-yellow-800' :
                          product.category === 'vegetables' ? 'bg-green-100 text-green-800' :
                          product.category === 'grains' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {categories.find(c => c.id === product.category)?.name || product.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

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

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">{product.vendor}</span>
                        <div className={`text-xs px-2 py-1 rounded ${
                          product.quantityAvailable > 10 ? 'bg-green-100 text-green-800' :
                          product.quantityAvailable > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.quantityAvailable > 0 ? `${product.quantityAvailable} available` : 'Out of stock'}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-center text-sm"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          className={`flex-1 py-2 px-4 rounded-md transition-colors text-sm font-medium ${
                            product.quantityAvailable === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                          disabled={product.quantityAvailable === 0}
                        >
                          {product.quantityAvailable === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating Cart Summary */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-gray-200 rounded-full px-6 py-3 flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''} • ₦{getTotalPrice().toLocaleString()}
          </span>
          <button
            onClick={proceedToCheckout}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-sm"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
