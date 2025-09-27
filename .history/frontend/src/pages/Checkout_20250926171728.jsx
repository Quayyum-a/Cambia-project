import React from 'react';
import { api } from '../lib/api';

export default function Checkout() {
  const [vendorId, setVendorId] = React.useState('');
  const [productId, setProductId] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [orderId, setOrderId] = React.useState('');
  const [escrowId, setEscrowId] = React.useState('');

  const createOrder = async () => {
    const { data } = await api.post('/orders', { vendorId, items: [{ product: productId, quantity: Number(quantity) }], meta: {} }, { headers: auth() });
    setOrderId(data._id);
  };

  const saveEscrow = async () => {
    await api.post(`/orders/${orderId}/escrow`, { escrowId }, { headers: auth() });
    alert('Escrow ID saved');
  };

  function auth() { const t = localStorage.getItem('token'); return { Authorization: `Bearer ${t}` }; }

  return (
    <div className="space-y-3">
      <div className="font-semibold">Create Order</div>
      <div className="grid gap-2 max-w-md">
        <input className="border p-2" placeholder="Vendor ID" value={vendorId} onChange={e=>setVendorId(e.target.value)} />
        <input className="border p-2" placeholder="Product ID" value={productId} onChange={e=>setProductId(e.target.value)} />
        <input className="border p-2" placeholder="Quantity" type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} />
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={createOrder}>Create</button>
      </div>
      {orderId && (
        <div className="space-y-2">
          <div>Order: {orderId}</div>
          <input className="border p-2" placeholder="Escrow Object ID (from wallet tx)" value={escrowId} onChange={e=>setEscrowId(e.target.value)} />
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={saveEscrow}>Save Escrow ID</button>
        </div>
      )}
    </div>
  );
}
