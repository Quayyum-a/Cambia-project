import React from 'react';
import { api } from '../lib/api';

export default function LogisticsPortal(){
  const [orderId, setOrderId] = React.useState('');
  const [payload, setPayload] = React.useState('verified');
  const [signature, setSignature] = React.useState('');
  const [publicKey, setPublicKey] = React.useState('');

  const submit = async () => {
    await api.post('/logistics/verify', { orderId, payload, signature, publicKey });
    alert('Verification submitted');
  };

  return (
    <div className="grid gap-2 max-w-lg">
      <div className="font-semibold">Logistics Verification</div>
      <input className="border p-2" placeholder="Order ID" value={orderId} onChange={e=>setOrderId(e.target.value)} />
      <input className="border p-2" placeholder="Public Key (base64) or leave blank to use server-configured" value={publicKey} onChange={e=>setPublicKey(e.target.value)} />
      <input className="border p-2" placeholder="Payload (string)" value={payload} onChange={e=>setPayload(e.target.value)} />
      <input className="border p-2" placeholder="Signature (base64)" value={signature} onChange={e=>setSignature(e.target.value)} />
      <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={submit}>Submit</button>
    </div>
  );
}
