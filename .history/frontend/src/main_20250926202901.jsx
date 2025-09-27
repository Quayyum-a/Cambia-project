import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import App from './App.jsx';
import Auth from './pages/Auth.jsx';
import Marketplace from './pages/Marketplace.jsx';
import SenderDashboard from './pages/SenderDashboard.jsx';
import Checkout from './pages/Checkout.jsx';
import VendorDashboard from './pages/VendorDashboard.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import LogisticsPortal from './pages/LogisticsPortal.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'marketplace', element: <Marketplace /> },
      { path: 'auth', element: <Auth /> },
      { path: 'auth/zklogin/success', element: <Auth /> },
      { path: 'auth/zklogin/error', element: <Auth /> },
      { path: 'sender', element: <SenderDashboard /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'vendor', element: <VendorDashboard /> },
      { path: 'order/:id', element: <OrderDetail /> },
      { path: 'logistics', element: <LogisticsPortal /> },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
