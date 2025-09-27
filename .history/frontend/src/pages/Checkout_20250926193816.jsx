
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
