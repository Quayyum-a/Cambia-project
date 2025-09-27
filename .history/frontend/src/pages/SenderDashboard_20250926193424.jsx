
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

