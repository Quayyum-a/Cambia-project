
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

function auth() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function SenderDashboard() {
  const [activeTab, setActiveTab] = useState('browse');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'sender') {
      navigate('/auth');
    }
    loadOrders();
  }, [navigate]);

  const loadVendorProducts = async (vendorId) => {
    try {
      setLoading(true);
      const response = await api.get(`/products/vendor/${vendorId}`);
      setProducts(response.data);
      setSelectedVendor(vendorId);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
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

  const createOrder = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    try {
      setLoading(true);
      const items = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', {
        vendorId: selectedVendor,
        items,
        meta: { orderDate: new Date().toISOString() }
      }, { headers: auth() });

      setCart([]);
      setActiveTab('orders');
      loadOrders();
      alert('Order created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      // Note: This would need a backend endpoint to get sender's orders
      // For now, we'll show a placeholder
      setOrders([]);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sender Dashboard</h1>
        <p className="text-gray-600">Browse products and manage your orders</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'browse'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Browse Products
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cart'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cart ({cart.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Orders
          </button>
        </nav>
      </div>

      {/* Browse Products Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Find Products</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter Vendor ID"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    loadVendorProducts(e.target.value);
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter Vendor ID"]');
                  if (input.value) loadVendorProducts(input.value);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>

          {products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
