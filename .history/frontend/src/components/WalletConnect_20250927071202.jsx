import React from 'react';
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

// Main Wallet Connect Component
export default function WalletConnect() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();

  console.log('WalletConnect render:', { currentAccount });

  if (currentAccount) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Wallet: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}</span>
        </div>
        <button
          onClick={() => {
            console.log('Disconnecting wallet');
            disconnectWallet();
          }}
          className="text-red-600 hover:text-red-800 text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <ConnectButton
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm transition-colors"
      />
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
