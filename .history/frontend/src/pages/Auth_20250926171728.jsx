import React from 'react';
import { api } from '../lib/api';

export default function Auth(){
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const login = async () => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    alert('Logged in');
  };

  return (
    <div className="grid gap-2 max-w-sm">
      <input className="border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={login}>Login</button>
    </div>
  );
}
