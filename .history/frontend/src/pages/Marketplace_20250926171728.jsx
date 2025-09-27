import React from 'react';
import { api } from '../lib/api';

export default function Marketplace() {
  const [vendorId, setVendorId] = React.useState('');
  const [products, setProducts] = React.useState([]);

  const load = async () => {
    if (!vendorId) return;
    const { data } = await api.get(`/products/vendor/${vendorId}`);
    setProducts(data);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className="border p-2" placeholder="Vendor ID" value={vendorId} onChange={e=>setVendorId(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={load}>Load Products</button>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.map(p => (
          <li key={p._id} className="border p-3 rounded">
            <div className="font-semibold">{p.name}</div>
            <div>₦{p.price}</div>
            <div>{p.quantityAvailable} {p.unit} available</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
