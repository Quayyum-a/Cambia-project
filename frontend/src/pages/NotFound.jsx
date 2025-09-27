import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white shadow rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔎</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-600 mb-6">The page you’re looking for doesn’t exist or was moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Go Home</Link>
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
