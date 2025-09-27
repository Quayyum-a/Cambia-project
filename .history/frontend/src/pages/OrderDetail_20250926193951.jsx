
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

function auth() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id) {
      navigate('/auth');
      return;
    }
    setUser(userData);
    loadOrderDetails();
  }, [id, navigate]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      // Note: This would need a backend endpoint to get order details
      // For now, we'll create a mock order based on the ID
      const mockOrder = {
        _id: id,
        status: 'prepared',
        totalPrice: 7500,
        createdAt: new Date().toISOString(),
        vendor: {
          _id: 'vendor1',
          name: 'Lagos Fresh Foods',
          email: 'vendor@lagosfoods.com',
          location: 'Lagos, Nigeria'
        },
        sender: {
          _id: 'sender1',
          name: 'John Doe',
          email: 'john@example.com'
        },
        items: [
          {
            _id: 'item1',
            name: 'Premium Rice',
            quantity: 2,
            unit: 'kg',
            price: 2500,
            description: 'High-quality Nigerian rice'
          },
          {
            _id: 'item2',
            name: 'Palm Oil',
            quantity: 1,
            unit: 'liter',
            price: 2500,
            description: 'Pure red palm oil'
          }
        ],
        escrowId: 'escrow_123456789',
        proofOfPackaging: 'QmSampleIPFSHash123456',
        statusHistory: [
          { status: 'pending', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Order created' },
          { status: 'received', timestamp: new Date(Date.now() - 43200000).toISOString(), description: 'Vendor received order' },
          { status: 'prepared', timestamp: new Date(Date.now() - 21600000).toISOString(), description: 'Order prepared for delivery' }
        ]
      };
      setOrder(mockOrder);
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'prepared': return 'bg-purple-100 text-purple-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'received': return '📦';
      case 'prepared': return '✅';
      case 'verified': return '🔍';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order #{order._id}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              <span className="mr-2">{getStatusIcon(order.status)}</span>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item._id} className="flex justify-between items-start border-b pb-4 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {item.quantity} {item.unit} × ₦{item.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">₦{(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>₦{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((status, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index === order.statusHistory.length - 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-green-600 text-white'
                  }`}>
                    {getStatusIcon(status.status)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold capitalize">{status.status}</h3>
                        <p className="text-gray-600 text-sm">{status.description}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(status.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Future steps */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <>
                  {order.status === 'prepared' && (
                    <div className="flex items-start opacity-50">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gray-300 text-gray-600">
                        🔍
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold">Verification</h3>
                        <p className="text-gray-600 text-sm">Waiting for logistics verification</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start opacity-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gray-300 text-gray-600">
                      🎉
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold">Completed</h3>
                      <p className="text-gray-600 text-sm">Order delivered and payment released</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Proof of Packaging */}
          {order.proofOfPackaging && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Proof of Packaging</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Packaging Photos</h3>
                    <p className="text-gray-600 text-sm">Uploaded by vendor for verification</p>
                  </div>
                  <a
                    href={`https://ipfs.io/ipfs/${order.proofOfPackaging}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    View Photos
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-mono">
                  IPFS Hash: {order.proofOfPackaging}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{order._id}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">₦{order.totalPrice.toFixed(2)}</span>
              </div>
              {order.escrowId && (
                <div className="flex justify-between">
                  <span>Escrow ID:</span>
                  <span className="font-mono text-xs">{order.escrowId}</span>
                </div>
              )}
            </div>
          </div>

