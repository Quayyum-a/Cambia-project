
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useWallet, useSuiClient } from '@mysten/dapp-kit';
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
  const wallet = useWallet();
  const suiClient = useSuiClient();

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

      const response = await api.post('/orders', {
        vendorId,
        items,
        meta: { 
          orderDate: new Date().toISOString(),
          customerNotes: 'Order from marketplace'
        }
      }, { headers: auth() });

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
    if (!wallet.connected || !order) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get Sui configuration
      const configResponse = await api.get('/sui/config');
      const { packageId } = configResponse.data;

      if (!packageId) {
        setError('Smart contract not configured');
        return;
      }

      // Create escrow transaction
      const tx = new Transaction();
      
      // This is a simplified example - in reality, you'd need to:
      // 1. Get the vendor's wallet address
      // 2. Get the logistics verifier address
      // 3. Handle the actual coin types and amounts
      // 4. Call the create_escrow function from the smart contract
      
      const vendorAddress = '0x1234567890abcdef'; // This should come from the order/vendor data
      const verifierAddress = '0xabcdef1234567890'; // This should come from config
      const amount = Math.floor(getTotalPrice() * 100); // Convert to smallest unit
      
      tx.moveCall({
        target: `${packageId}::simple_escrow::create_escrow`,
        arguments: [
          tx.pure.address(wallet.currentAccount?.address),
          tx.pure.address(vendorAddress),
          tx.pure.address(verifierAddress),
          tx.object('0x2::sui::SUI'), // This should be the actual coin object
          tx.pure.u64(amount),
          tx.pure.string(`order-${order._id}`)
        ],
      });

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
      });

      if (result.effects?.status?.status === 'success') {
        // Extract escrow object ID from transaction result
        const escrowObjectId = result.effects.created?.[0]?.reference?.objectId;
        
        if (escrowObjectId) {
          setEscrowId(escrowObjectId);
          
          // Save escrow ID to backend
          await api.post(`/orders/${order._id}/escrow`, {
            escrowId: escrowObjectId
          }, { headers: auth() });
          
          setStep('escrow-setup');
        }
      } else {
        setError('Failed to create escrow');
      }
    } catch (err) {
      setError(err.message || 'Failed to create escrow');
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
                To secure your payment and ensure safe delivery, you need to create an escrow contract on the Sui blockchain.
                This will lock your payment until the vendor delivers and the logistics provider verifies the order.
              </p>
              
              {!wallet.connected ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                  Please connect your Sui wallet to continue with escrow setup.
                </div>
              ) : (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                  Wallet connected: {wallet.currentAccount?.address?.slice(0, 10)}...
                </div>
              )}
            </div>
          </div>

          <button
            onClick={createEscrow}
            disabled={loading || !wallet.connected}
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Creating Escrow...' : 'Setup Escrow Payment'}
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
