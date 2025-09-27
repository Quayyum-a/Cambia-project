import React, { useState } from 'react';
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { WalletProvider, ConnectModal, useWallet } from '@suiet/wallet-kit';

// Suiet Wallet Component
function SuietWalletButton({ onWalletConnect }) {
  const wallet = useWallet();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = () => {
    setShowModal(true);
  };

  React.useEffect(() => {
    if (wallet.connected && wallet.account) {
      onWalletConnect(wallet.account.address, 'suiet');
    }
  }, [wallet.connected, wallet.account, onWalletConnect]);

  if (wallet.connected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Suiet: {wallet.account?.address?.slice(0, 6)}...{wallet.account?.address?.slice(-4)}</span>
        </div>
        <button
          onClick={() => wallet.disconnect()}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleConnect}
        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
      >
        Connect Suiet Wallet
      </button>
      <ConnectModal
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
}

// Main Wallet Connect Component
export default function WalletConnect() {
  const [walletType, setWalletType] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectMysten } = useDisconnectWallet();

  const handleWalletConnect = (address, type) => {
    setConnectedWallet({ address, type });
  };

  React.useEffect(() => {
    if (currentAccount) {
      setConnectedWallet({ address: currentAccount.address, type: 'mysten' });
    }
  }, [currentAccount]);

  const handleDisconnect = () => {
    if (connectedWallet?.type === 'mysten') {
      disconnectMysten();
    }
    setConnectedWallet(null);
    setWalletType(null);
  };

  if (connectedWallet) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="capitalize">{connectedWallet.type}: {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (walletType === 'mysten') {
    return (
      <div className="flex items-center gap-2">
        <ConnectButton
          connectText="Connect Mysten Wallet"
          className="!bg-blue-600 !text-white !px-4 !py-2 !rounded-md hover:!bg-blue-700 !text-sm"
        />
        <button
          onClick={() => setWalletType(null)}
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          Back
        </button>
      </div>
    );
  }

  if (walletType === 'suiet') {
    return (
      <WalletProvider>
        <div className="flex items-center gap-2">
          <SuietWalletButton onWalletConnect={handleWalletConnect} />
          <button
            onClick={() => setWalletType(null)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Back
          </button>
        </div>
      </WalletProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setWalletType('mysten')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm mr-2"
        >
          Mysten Wallet
        </button>
        <button
          onClick={() => setWalletType('suiet')}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
        >
          Suiet Wallet
        </button>
      </div>
    </div>
  );
}

// Enhanced Wallet Provider Component
export function EnhancedWalletProvider({ children }) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
}

// Wallet Status Hook
export function useWalletStatus() {
  const currentAccount = useCurrentAccount();
  const suietWallet = useWallet();

  const getWalletInfo = () => {
    if (currentAccount) {
      return {
        connected: true,
        address: currentAccount.address,
        type: 'mysten',
        account: currentAccount
      };
    }
    
    if (suietWallet?.connected) {
      return {
        connected: true,
        address: suietWallet.account?.address,
        type: 'suiet',
        account: suietWallet.account
      };
    }

    return {
      connected: false,
      address: null,
      type: null,
      account: null
    };
  };

  return getWalletInfo();
}
