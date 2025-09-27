import React from 'react';
import { api } from '../lib/api';

function auth() { const t = localStorage.getItem('token'); return { Authorization: `Bearer ${t}` }; }

export default function VendorDashboard() {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [qty, setQty] = React.useState('');
  const [unit, setUnit] = React.useState('kg');
  const [orderId, setOrderId] = React.useState('');
  const [file, setFile] = React.useState(null);

  const addProduct = async () => {
    await api.post('/vendor/products', { name, description: '', price: Number(price), quantityAvailable: Number(qty), unit }, { headers: auth() });
    alert('Added');
  };

  const receive = async () => { await api.post(`/vendor/orders/${orderId}/receive`, {}, { headers: auth() }); alert('received'); };
  const prepare = async () => { await api.post(`/vendor/orders/${orderId}/prepare`, {}, { headers: auth() }); alert('prepared'); };
  const upload = async () => {
    const fd = new FormData();
    fd.append('file', file);
    await api.post(`/vendor/orders/${orderId}/proof/upload`, fd, { headers: { ...auth(), 'Content-Type': 'multipart/form-data' } });
    alert('proof uploaded');
  };

  return (
    <div className="grid gap-4 max-w-xl">
      <div className="font-semibold">Add Product</div>
      <input className="border p-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input className="border p-2" placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} />
      <input className="border p-2" placeholder="Quantity" value={qty} onChange={e=>setQty(e.target.value)} />
      <input className="border p-2" placeholder="Unit" value={unit} onChange={e=>setUnit(e.target.value)} />
      <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={addProduct}>Create</button>

      <div className="font-semibold pt-6">Fulfillment</div>
      <input className="border p-2" placeholder="Order ID" value={orderId} onChange={e=>setOrderId(e.target.value)} />
      <div className="flex gap-2">
        <button className="bg-gray-700 text-white px-3 py-2 rounded" onClick={receive}>Receive</button>
        <button className="bg-gray-700 text-white px-3 py-2 rounded" onClick={prepare}>Prepare</button>
      </div>
      <input type="file" onChange={e=>setFile(e.target.files[0])} />
      <button className="bg-green-700 text-white px-3 py-2 rounded" onClick={upload}>Upload Proof</button>
    </div>
  );
}
