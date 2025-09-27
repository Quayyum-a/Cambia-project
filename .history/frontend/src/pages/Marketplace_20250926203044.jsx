import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/products/vendor/${vendorId}`);
      setProducts(response.data);
      setSelectedVendor(vendorId);
    } catch (err) {
      setError('Failed to load products. This vendor may not have any products yet.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cambia Marketplace</h1>
        <p className="text-gray-600">Discover authentic Nigerian food products from trusted vendors</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Vendors</h2>
            <div className="space-y-3">
              {vendors.map(vendor => (
                <div
                  key={vendor.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedVendor === vendor.id
                      ? 'bg-blue-100 border-blue-300 border'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => loadVendorProducts(vendor.id)}
                >
                  <div className="font-medium">{vendor.name}</div>
                  <div className="text-sm text-gray-600">{vendor.location}</div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm ml-1">{vendor.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">{vendor.products} products</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Cart ({getCartItemCount()} items)</h3>
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.product._id} className="flex justify-between items-center text-sm">
                    <span className="truncate">{item.product.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                        className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full text-xs"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                        className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold mb-4">
                  <span>Total:</span>
                  <span>₦{getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {!selectedVendor ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <div className="text-gray-400 text-6xl mb-4">🏪</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Cambia Marketplace</h2>
              <p className="text-gray-500 mb-6">Select a vendor from the sidebar to browse their products</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">🌾 Fresh Produce</h3>
                  <p className="text-blue-700 text-sm">Direct from Nigerian farms</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">🌶️ Authentic Spices</h3>
                  <p className="text-green-700 text-sm">Traditional Nigerian flavors</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900">🥜 Premium Grains</h3>
                  <p className="text-yellow-700 text-sm">High-quality staples</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900">🐟 Fresh Seafood</h3>
                  <p className="text-red-700 text-sm">Coastal delicacies</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Search and Filters */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Products
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name or description..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="10000"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                  <p className="text-gray-500">
                    {products.length === 0 
                      ? "This vendor hasn't added any products yet." 
                      : "Try adjusting your search or price filters."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                        )}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold text-green-600">₦{product.price}</span>
                          <span className="text-sm text-gray-500">per {product.unit}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            product.quantityAvailable > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.quantityAvailable > 0 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {product.quantityAvailable > 0 
                              ? `${product.quantityAvailable} ${product.unit} available`
                              : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.quantityAvailable === 0}
                        className={`w-full py-2 rounded-md font-medium transition-colors ${
                          product.quantityAvailable === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {product.quantityAvailable === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

