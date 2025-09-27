import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ErrorBoundary from './pages/ErrorBoundary.jsx';
import NotFound from './pages/NotFound.jsx';
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
  { path: '/login', element: <Navigate to="/auth" replace />, errorElement: <ErrorBoundary /> },
  { path: '/auth', element: <Auth />, errorElement: <ErrorBoundary /> },
  { path: '/register', element: <Auth />, errorElement: <ErrorBoundary /> },
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'marketplace', element: <Marketplace /> },
      { path: 'product/:id', element: <ProductDetail /> },
      { path: 'auth', element: <Auth /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Auth /> },
      { path: 'auth/zklogin/success', element: <Auth /> },
      { path: 'auth/zklogin/error', element: <Auth /> },
      { path: 'sender', element: <SenderDashboard /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'vendor', element: <VendorDashboard /> },
      { path: 'order/:id', element: <OrderDetail /> },
      { path: 'logistics', element: <LogisticsPortal /> },
      { path: '*', element: <NotFound /> },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
