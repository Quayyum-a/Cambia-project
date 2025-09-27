import React, { useState } from 'react';
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { WalletProvider as SuietWalletProvider, useWallet, ConnectButton as SuietConnectButton } from '@suiet/wallet-kit';

// Main Wallet Connect Component
export default function WalletConnect() {
  const [walletType, setWalletType] = useState(null); // 'mysten' or 'suiet'
  const mystenAccount = useCurrentAccount();
  const { mutate: disconnectMystenWallet } = useDisconnectWallet();
  const suietWallet = useWallet();

  console.log('WalletConnect render:', { mystenAccount, suietWallet, walletType });

  // Determine which wallet is connected
  const currentAccount = mystenAccount || (suietWallet?.connected ? suietWallet.account : null);
  const isConnected = !!currentAccount;

  if (isConnected) {
    const walletName = mystenAccount ? 'Sui Wallet' : 'Suiet Wallet';
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>{walletName}: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}</span>
        </div>
        <button
          onClick={() => {
            console.log('Disconnecting wallet');
            if (mystenAccount) {
              disconnectMystenWallet();
            } else if (suietWallet?.connected) {
              suietWallet.disconnect();
            }
            setWalletType(null);
          }}
          className="text-red-600 hover:text-red-800 text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <ConnectButton
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm transition-colors"
        onConnectSuccess={(account) => {
          console.log('Mysten wallet connected:', account);
          setWalletType('mysten');
        }}
        onConnectError={(error) => {
          console.log('Mysten wallet connection error:', error);
        }}
      />
      <SuietConnectButton
        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm transition-colors"
        onConnectSuccess={(account) => {
          console.log('Suiet wallet connected:', account);
          setWalletType('suiet');
        }}
        onConnectError={(error) => {
          console.log('Suiet wallet connection error:', error);
        }}
      >
        Connect Suiet
      </SuietConnectButton>
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
