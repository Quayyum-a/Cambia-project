
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function LogisticsPortal() {
  const [activeTab, setActiveTab] = useState('verify');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Verification form state
  const [verificationForm, setVerificationForm] = useState({
    orderId: '',
    payload: 'verified',
    signature: '',
    publicKey: ''
  });

  // Order search state
  const [searchOrderId, setSearchOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'logistics') {
      navigate('/auth');
    }
    loadPendingOrders();
  }, [navigate]);

  const loadPendingOrders = async () => {
    try {
      // Note: This would need a backend endpoint to get orders pending verification
      // For now, we'll show a placeholder
      setOrders([]);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const searchOrder = async (orderId) => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      // Note: This would need a backend endpoint to get order details
      // For now, we'll show a placeholder
      setOrderDetails({
        _id: orderId,
        status: 'prepared',
        totalPrice: 5000,
        vendor: { name: 'Sample Vendor' },
        sender: { name: 'Sample Customer' },
        items: [
          { name: 'Rice', quantity: 2, unit: 'kg', price: 2500 }
        ],
        proofOfPackaging: 'QmSampleIPFSHash123',
        escrowId: 'sample-escrow-id'
      });
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationFormChange = (e) => {
    setVerificationForm({
      ...verificationForm,
      [e.target.name]: e.target.value
    });
  };

  const submitVerification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/logistics/verify', verificationForm);
      
      setVerificationForm({
        orderId: '',
        payload: 'verified',
        signature: '',
        publicKey: ''
      });
      
      alert('Verification submitted successfully!');
      loadPendingOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const quickVerify = async (orderId) => {
    try {
      setLoading(true);
      await api.post('/logistics/verify', {
        orderId,
        payload: 'verified',
        signature: 'auto-generated-signature',
        publicKey: ''
      });
      
      alert('Order verified successfully!');
      loadPendingOrders();
    } catch (err) {
      setError('Failed to verify order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Logistics Portal</h1>
        <p className="text-gray-600">Verify orders and manage logistics operations</p>
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
            onClick={() => setActiveTab('verify')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'verify'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manual Verification
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Orders
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Order Search
          </button>
        </nav>
      </div>

      {/* Manual Verification Tab */}
      {activeTab === 'verify' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Manual Order Verification</h2>
            <form onSubmit={submitVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  name="orderId"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter order ID to verify"
                  value={verificationForm.orderId}
                  onChange={handleVerificationFormChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Key (Base64)
                </label>
                <input
                  type="text"
                  name="publicKey"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Leave blank to use server-configured key"
                  value={verificationForm.publicKey}
                  onChange={handleVerificationFormChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Override the default logistics public key
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Payload
                </label>
                <select
                  name="payload"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={verificationForm.payload}
                  onChange={handleVerificationFormChange}
                >
                  <option value="verified">Verified - Release Payment</option>
                  <option value="rejected">Rejected - Return Funds</option>
                  <option value="pending">Pending - Need More Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Digital Signature (Base64)
                </label>
                <textarea
                  name="signature"
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter your digital signature for this verification"
                  value={verificationForm.signature}
                  onChange={handleVerificationFormChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Sign the payload with your private key to authenticate the verification
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting Verification...' : 'Submit Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pending Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Orders Pending Verification</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg">No orders pending verification</p>
                <p className="text-gray-400">Orders ready for verification will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Order #{order._id}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-gray-600">Status: <span className="font-medium">{order.status}</span></p>
                            <p className="text-gray-600">Total: <span className="font-medium">₦{order.totalPrice}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-600">Vendor: <span className="font-medium">{order.vendor?.name}</span></p>
                            <p className="text-gray-600">Customer: <span className="font-medium">{order.sender?.name}</span></p>
                          </div>
                        </div>
                        {order.proofOfPackaging && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Proof: <a href={`https://ipfs.io/ipfs/${order.proofOfPackaging}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Packaging Photos</a>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/order/${order._id}`)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => quickVerify(order._id)}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                        >
                          Quick Verify
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

      {/* Order Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Search Order Details</h2>
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Enter Order ID"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchOrder(searchOrderId);
                  }
                }}
              />
              <button
                onClick={() => searchOrder(searchOrderId)}
                disabled={loading || !searchOrderId}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {orderDetails && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Order Details</h3>
