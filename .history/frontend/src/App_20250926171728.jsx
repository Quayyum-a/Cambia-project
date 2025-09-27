import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import WalletConnect from './components/WalletConnect.jsx';
import { getSuiConfig } from './lib/sui.js';

export default function App() {
  const [cfg, setCfg] = React.useState(null);
  React.useEffect(() => { getSuiConfig().then(setCfg); }, []);
  if (!cfg) return <div className="p-4">Loading...</div>;
  const { network, url } = cfg;
  const { networkConfig } = createNetworkConfig({ [network]: { url } });
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork={network}>
      <WalletProvider autoConnect>
        <div className="p-4 space-y-4">
          <nav className="flex gap-4">
            <Link to="/">Marketplace</Link>
            <Link to="/checkout">Checkout</Link>
            <Link to="/vendor">Vendor</Link>
            <Link to="/logistics">Logistics</Link>
            <div className="ml-auto"><WalletConnect /></div>
          </nav>
          <Outlet />
        </div>
      </WalletProvider>
    </SuiClientProvider>
  );
}
