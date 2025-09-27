import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useCurrentWallet, useSuiClient } from '@mysten/dapp-kit';
import { useWallet as useSuietWallet } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui/transactions';

function auth() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('review'); // review, order-created, escrow-setup, completed
  const [escrowId, setEscrowId] = useState('');
  
  const navigate = useNavigate();
  const { currentWallet } = useCurrentWallet();
  const suiClient = useSuiClient();
  const suietWallet = useSuietWallet();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'sender') {
      navigate('/auth');
      return;
    }

    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      navigate('/');
      return;
    }
    setCart(savedCart);
  }, [navigate]);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      setError('');

      if (cart.length === 0) {
        setError('Cart is empty');
        return;
      }

      // Group items by vendor
      const vendorGroups = cart.reduce((groups, item) => {
        const vendorId = item.vendorId;
        if (!groups[vendorId]) {
          groups[vendorId] = [];
        }
        groups[vendorId].push(item);
        return groups;
      }, {});

      // For now, we'll create one order (assuming single vendor)
      const vendorId = Object.keys(vendorGroups)[0];
      const items = vendorGroups[vendorId].map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      console.log('🛒 Creating order with data:', {
        vendorId,
        items,
        meta: {
          orderDate: new Date().toISOString(),
          customerNotes: 'Order from marketplace'
        },
        auth: auth()
      });

      const response = await api.post('/orders', {
        vendorId,
        items,
        meta: {
          orderDate: new Date().toISOString(),
          customerNotes: 'Order from marketplace'
        }
      }, { headers: auth() });

      console.log('✅ Order created:', response.data);

      setOrder(response.data);
      setStep('order-created');
      
      // Clear cart
      localStorage.removeItem('cart');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async () => {
    if (!order) {
      setError('No order found');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Check for connected wallets and use real addresses if available
      const connectedWallet = currentWallet || (suietWallet?.connected ? suietWallet.account : null);
      const senderAddress = connectedWallet?.address || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // Demo fallback

      console.log('🎯 Creating Escrow:', {
        walletConnected: !!connectedWallet,
        walletType: currentWallet ? 'Mysten' : suietWallet?.connected ? 'Suiet' : 'Demo',
        senderAddress
      });

      const escrowData = {
        senderAddress,
        vendorAddress: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', // Demo vendor
        verifierAddress: '0x1111111111111111111111111111111111111111111111111111111111111111', // Demo verifier
        amount: getTotalPrice(),
        unlockKey: `escrow-key-${order._id}-${Date.now()}`
      };

      const result = await api.post('/demo-escrow/create', escrowData);

      if (result.data.escrowId) {
        setEscrowId(result.data.escrowId);

        // Save escrow ID to backend
        await api.post(`/orders/${order._id}/escrow`, {
          escrowId: result.data.escrowId
        }, { headers: auth() });

        setStep('escrow-setup');

        console.log('✅ Demo Escrow Created Successfully!');
        console.log('🔗 Escrow ID:', result.data.escrowId);
        console.log('💰 Amount Locked:', getTotalPrice());
      } else {
        setError('Failed to create demo escrow');
      }
    } catch (err) {
      console.error('❌ Escrow creation error:', err);
      setError(err.response?.data?.error || 'Failed to create escrow');
    } finally {
      setLoading(false);
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product._id !== productId));
      return;
    }
    setCart(cart.map(item => 
      item.product._id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600">Review your order and complete the purchase</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step === 'review' ? 'text-blue-600' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'review' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Review Order</span>
          </div>
          <div className={`flex items-center ${
            step === 'order-created' ? 'text-blue-600' : 
            ['escrow-setup', 'completed'].includes(step) ? 'text-green-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'order-created' ? 'bg-blue-600 text-white' :
              ['escrow-setup', 'completed'].includes(step) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Create Order</span>
          </div>
          <div className={`flex items-center ${
            step === 'escrow-setup' ? 'text-blue-600' : 
            step === 'completed' ? 'text-green-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'escrow-setup' ? 'bg-blue-600 text-white' :
              step === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Setup Escrow</span>
          </div>
          <div className={`flex items-center ${step === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              4
            </div>
            <span className="ml-2 font-medium">Complete</span>
          </div>
        </div>
      </div>

      {/* Step 1: Review Order */}
      {step === 'review' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product._id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-gray-600">₦{item.product.price} per {item.product.unit}</p>
                    {item.product.description && (
                      <p className="text-sm text-gray-500">{item.product.description}</p>
                    )}
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
                    <span className="font-semibold w-24 text-right">
                      ₦{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>₦{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={createOrder}
            disabled={loading || cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      )}

      {/* Step 2: Order Created */}
      {step === 'order-created' && order && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center mb-6">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-semibold text-gray-900">Order Created Successfully!</h2>
              <p className="text-gray-600">Order ID: {order._id}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Next Step: Setup Escrow</h3>
              <p className="text-sm text-gray-600 mb-4">
                To secure your payment and ensure safe delivery, we'll create an escrow contract on the Sui blockchain.
                This will lock your payment until the vendor delivers and the logistics provider verifies the order.
              </p>

              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span>Demo Mode: Wallet connection not required - using simulated blockchain escrow</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={createEscrow}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Setting Up Escrow...' : 'Continue with Demo Escrow'}
          </button>
        </div>
      )}

      {/* Step 3: Escrow Setup */}
      {step === 'escrow-setup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center mb-6">
              <div className="text-blue-600 text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-semibold text-gray-900">Escrow Created Successfully!</h2>
              <p className="text-gray-600">Your payment is now secured on the blockchain</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Escrow Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">{order._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow ID:</span>
                    <span className="font-mono">{escrowId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Locked:</span>
                    <span>₦{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
                <ol className="text-sm text-green-700 space-y-1">
                  <li>1. The vendor will receive and prepare your order</li>
                  <li>2. The vendor will upload proof of packaging</li>
                  <li>3. The logistics provider will verify the order</li>
                  <li>4. Your payment will be released to the vendor</li>
                  <li>5. You will receive your order!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/order/${order._id}`)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold"
            >
              Track Order
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
