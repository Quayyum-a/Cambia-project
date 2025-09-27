import React, { useEffect } from 'react';
import { useRouteError, Link } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();
  const message = (error && (error.statusText || error.message)) || 'Something went wrong';
  const status = error && error.status ? error.status : '';

  // Log error for monitoring
  useEffect(() => {
    console.error('🚨 Application Error:', {
      message,
      status,
      error: error,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // In production, this would send to error monitoring service like Sentry
    // Example: Sentry.captureException(error);
  }, [error, message, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white shadow rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unexpected Application Error</h2>
        <p className="text-gray-600 mb-6">{status ? `${status} - ` : ''}{message}</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Go Home</Link>
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

