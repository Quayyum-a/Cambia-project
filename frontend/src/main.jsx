import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { WalletProvider as SuietWalletProvider } from '@suiet/wallet-kit';
import ErrorBoundary from './pages/ErrorBoundary.jsx';
import NotFound from './pages/NotFound.jsx';
import { ToastProvider } from './components/ToastContainer.jsx';
import './styles.css';
import App, { ProtectedRoute, PublicRoute } from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import Auth from './pages/Auth.jsx';
import Login from './pages/Login.jsx';
import Marketplace from './pages/Marketplace.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import SenderDashboard from './pages/SenderDashboard.jsx';
import Checkout from './pages/Checkout.jsx';
import VendorDashboard from './pages/VendorDashboard.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import LogisticsPortal from './pages/LogisticsPortal.jsx';

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <Navigate to="/auth" replace />, errorElement: <ErrorBoundary /> },
  {
    path: '/auth',
    element: (
      <PublicRoute>
        <Auth />
      </PublicRoute>
    ),
    errorElement: <ErrorBoundary />
  },
  { path: '/register', element: <Navigate to="/auth" replace />, errorElement: <ErrorBoundary /> },
  { path: '/auth/zklogin/success', element: <Navigate to="/auth" replace />, errorElement: <ErrorBoundary /> },
  { path: '/auth/zklogin/error', element: <Navigate to="/auth" replace />, errorElement: <ErrorBoundary /> },

  // Protected routes
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'marketplace',
        element: (
          <ProtectedRoute allowedRoles={['sender']}>
            <Marketplace />
          </ProtectedRoute>
        )
      },
      {
        path: 'product/:id',
        element: (
          <ProtectedRoute allowedRoles={['sender']}>
            <ProductDetail />
          </ProtectedRoute>
        )
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute allowedRoles={['sender']}>
            <Checkout />
          </ProtectedRoute>
        )
      },
      {
        path: 'sender',
        element: (
          <ProtectedRoute allowedRoles={['sender']}>
            <SenderDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'vendor',
        element: (
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'logistics',
        element: (
          <ProtectedRoute allowedRoles={['logistics']}>
            <LogisticsPortal />
          </ProtectedRoute>
        )
      },
      {
        path: 'order/:id',
        element: <ProtectedRoute><OrderDetail /></ProtectedRoute>
      },
      { path: '*', element: <NotFound /> },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <SuietWalletProvider>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </SuietWalletProvider>
);
