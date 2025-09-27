import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import App from './App.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Checkout from './pages/Checkout.jsx';
import VendorDashboard from './pages/VendorDashboard.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import LogisticsPortal from './pages/LogisticsPortal.jsx';

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Marketplace /> },
    { path: 'checkout', element: <Checkout /> },
    { path: 'vendor', element: <VendorDashboard /> },
    { path: 'order/:id', element: <OrderDetail /> },
    { path: 'logistics', element: <LogisticsPortal /> },
  ]}
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
