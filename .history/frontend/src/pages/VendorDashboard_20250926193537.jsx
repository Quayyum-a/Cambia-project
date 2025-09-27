
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

function auth() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    quantityAvailable: '',
    unit: 'kg'
  });

  // Order management state
  const [selectedOrder, setSelectedOrder] = useState('');
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'vendor') {
      navigate('/auth');
    }
    loadProducts();
    loadOrders();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendor/products', { headers: auth() });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      // Note: This would need a backend endpoint to get vendor's orders
      // For now, we'll show a placeholder
      setOrders([]);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const handleProductFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/vendor/products', {
        ...productForm,
        price: Number(productForm.price),
        quantityAvailable: Number(productForm.quantityAvailable)
      }, { headers: auth() });
      
      setProductForm({
        name: '',
        description: '',
        price: '',
        quantityAvailable: '',
        unit: 'kg'
      });
      loadProducts();
      alert('Product added successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (productId, newQuantity) => {
    try {
      await api.patch(`/vendor/products/${productId}/stock`, {
        quantity: Number(newQuantity)
      }, { headers: auth() });
      loadProducts();
      alert('Stock updated successfully!');
    } catch (err) {
      setError('Failed to update stock');
    }
  };

  const updateProductPrice = async (productId, newPrice) => {
    try {
      await api.patch(`/vendor/products/${productId}/price`, {
        price: Number(newPrice)
      }, { headers: auth() });
      loadProducts();
      alert('Price updated successfully!');
    } catch (err) {
      setError('Failed to update price');
    }
  };

  const receiveOrder = async (orderId) => {
    try {
      await api.post(`/vendor/orders/${orderId}/receive`, {}, { headers: auth() });
      loadOrders();
      alert('Order received successfully!');
    } catch (err) {
      setError('Failed to receive order');
    }
  };

  const prepareOrder = async (orderId) => {
    try {
      await api.post(`/vendor/orders/${orderId}/prepare`, {}, { headers: auth() });
      loadOrders();
      alert('Order prepared successfully!');
    } catch (err) {
      setError('Failed to prepare order');
    }
  };

  const uploadProof = async (orderId) => {
    if (!proofFile) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', proofFile);
      
      await api.post(`/vendor/orders/${orderId}/proof/upload`, formData, {
        headers: {
          ...auth(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProofFile(null);
      loadOrders();
      alert('Proof uploaded successfully!');
    } catch (err) {
      setError('Failed to upload proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-600">Manage your products and orders</p>
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
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('add-product')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'add-product'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add Product
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('fulfillment')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fulfillment'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Fulfillment
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Products</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">No products yet. Add your first product!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product._id} className="border p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-semibold">₦{product.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className="font-semibold">{product.quantityAvailable} {product.unit}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="New stock"
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              updateProductStock(product._id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            if (input.value) {
                              updateProductStock(product._id, input.value);
                              input.value = '';
                            }
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Update Stock
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="New price"
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              updateProductPrice(product._id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            if (input.value) {
                              updateProductPrice(product._id, input.value);
                              input.value = '';
                            }
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Update Price
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === 'add-product' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
            <form onSubmit={addProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Available
                  </label>
                  <input
                    type="number"
                    name="quantityAvailable"
                    required
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={productForm.quantityAvailable}
                    onChange={handleProductFormChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={productForm.unit}
                    onChange={handleProductFormChange}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="lb">Pound (lb)</option>
                    <option value="piece">Piece</option>
                    <option value="pack">Pack</option>
                    <option value="bag">Bag</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Incoming Orders</h2>
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
                        <p className="text-gray-600">Customer: {order.sender?.email}</p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => navigate(`/order/${order._id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fulfillment Tab */}
      {activeTab === 'fulfillment' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Fulfillment</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  placeholder="Enter Order ID"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => receiveOrder(selectedOrder)}
                  disabled={!selectedOrder || loading}
                  className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  Mark as Received
                </button>
                <button
                  onClick={() => prepareOrder(selectedOrder)}
                  disabled={!selectedOrder || loading}
