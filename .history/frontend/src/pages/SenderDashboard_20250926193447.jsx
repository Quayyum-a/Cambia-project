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
                    <span className="text-2xl font-bold text-green-600">₦{product.price}</span>
                    <span className="text-sm text-gray-500">
                      {product.quantityAvailable} {product.unit} available
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                    disabled={product.quantityAvailable === 0}
                  >
                    {product.quantityAvailable === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.product._id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-gray-600">₦{item.product.price} per {item.product.unit}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                            className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold w-20 text-right">
                          ₦{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold">Total: ₦{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={createOrder}
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Creating Order...' : 'Create Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Order #{order._id}</h3>
                        <p className="text-gray-600">Status: {order.status}</p>
                        <p className="text-gray-600">Total: ₦{order.totalPrice}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}