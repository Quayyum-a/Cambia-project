import React, { useState } from 'react';
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { WalletProvider, ConnectModal, useWallet } from '@suiet/wallet-kit';

// Suiet Wallet Component
function SuietWalletButton() {
  const wallet = useWallet();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = () => {
    setShowModal(true);
  };

  const handleDisconnect = () => {
    wallet.disconnect();
  };

  if (wallet.connected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{wallet.account?.address?.slice(0, 6)}...{wallet.account?.address?.slice(-4)}</span>
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

  return (
    <>
      <button
        onClick={handleConnect}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
      >
        Connect Suiet
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
  const [walletType, setWalletType] = useState('mysten'); // 'mysten' or 'suiet'
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const handleWalletTypeChange = (type) => {
    // Disconnect current wallet before switching
    if (currentAccount) {
      disconnect();
    }
    setWalletType(type);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Wallet Type Selector */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
        <button
          onClick={() => handleWalletTypeChange('mysten')}
          className={`px-2 py-1 text-xs rounded ${
            walletType === 'mysten' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Mysten
        </button>
        <button
          onClick={() => handleWalletTypeChange('suiet')}
          className={`px-2 py-1 text-xs rounded ${
            walletType === 'suiet' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Suiet
        </button>
      </div>

      {/* Wallet Connection */}
      {walletType === 'mysten' ? (
        <div className="flex items-center gap-2">
          {currentAccount ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <ConnectButton 
              connectText="Connect Wallet"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            />
          )}
        </div>
      ) : (
        <WalletProvider>
          <SuietWalletButton />
        </WalletProvider>
      )}
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
