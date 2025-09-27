
import { api } from './api';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

export async function getSuiConfig() {
  try {
    const { data } = await api.get('/sui/config');
    return { 
      network: 'testnet', 
      url: data.rpcUrl, 
      packageId: data.packageId, 
      logisticsPublicKey: data.logisticsPublicKey 
    };
  } catch (error) {
    console.error('Failed to get Sui config:', error);
    return {
      network: 'testnet',
      url: 'https://fullnode.testnet.sui.io:443',
      packageId: '',
      logisticsPublicKey: ''
    };
  }
}

export class SuiEscrowService {
  constructor(suiClient, packageId) {
    this.suiClient = suiClient;
    this.packageId = packageId;
  }

  /**
   * Create an escrow contract for an order
   */
  async createEscrow({
    senderAddress,
    vendorAddress,
    verifierAddress,
    coinObject,
    amount,
    unlockKey
  }) {
    const tx = new Transaction();

    // Call the create_escrow function from the smart contract
    const [escrow, remainingCoin] = tx.moveCall({
      target: `${this.packageId}::simple_escrow::create_escrow`,
      arguments: [
        tx.pure.address(senderAddress),
        tx.pure.address(vendorAddress),
        tx.pure.address(verifierAddress),
        tx.object(coinObject),
        tx.pure.u64(amount),
        tx.pure.string(unlockKey)
      ],
      typeArguments: ['0x2::sui::SUI'] // Input coin type
    });

    // Transfer the escrow object to the sender (they own it until completion)
    tx.transferObjects([escrow], senderAddress);
    
    // Transfer remaining coins back to sender
    tx.transferObjects([remainingCoin], senderAddress);

    return tx;
  }

  /**
   * Upload proof of packaging (vendor action)
   */
  async uploadProof({
    vendorAddress,
    escrowObjectId,
    proofHash
  }) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::simple_escrow::upload_proof`,
      arguments: [
        tx.pure.address(vendorAddress),
        tx.object(escrowObjectId),
        tx.pure.string(proofHash)
      ],
      typeArguments: ['0x2::sui::SUI']
    });

    return tx;
  }

  /**
   * Verify and release funds (logistics verifier action)
   */
  async verifyAndRelease({
    verifierAddress,
    escrowObjectId,
    payoutCoins,
    unlockKey
  }) {
    const tx = new Transaction();

    const [refund, vendorPayment, remainingPayout] = tx.moveCall({
      target: `${this.packageId}::simple_escrow::verify_and_release`,
      arguments: [
        tx.pure.address(verifierAddress),
        tx.object(escrowObjectId),
        tx.object(payoutCoins),
        tx.pure.string(unlockKey)
      ],
      typeArguments: ['0x2::sui::SUI', '0x2::sui::SUI'] // Input and output coin types
    });

    // Transfer refund back to original sender
    // Transfer payment to vendor
    // Transfer remaining payout back to verifier
    // Note: These addresses would need to be determined from the escrow object

    return tx;
  }

  /**
   * Cancel escrow (sender action)
   */
  async cancelEscrow({
    senderAddress,
    escrowObjectId
  }) {
    const tx = new Transaction();

    const refund = tx.moveCall({
      target: `${this.packageId}::simple_escrow::cancel_escrow`,
      arguments: [
        tx.pure.address(senderAddress),
        tx.object(escrowObjectId)
      ],
      typeArguments: ['0x2::sui::SUI']
    });

    tx.transferObjects([refund], senderAddress);

    return tx;
  }

  /**
   * Get escrow details
   */
  async getEscrowDetails(escrowObjectId) {
    try {
      const escrowObject = await this.suiClient.getObject({
        id: escrowObjectId,
        options: {
          showContent: true,
          showType: true
        }
      });

      if (escrowObject.data?.content?.dataType === 'moveObject') {
        const fields = escrowObject.data.content.fields;
        return {
          id: escrowObjectId,
          sender: fields.sender,
          vendor: fields.vendor,
          verifier: fields.verifier,
          amount: fields.amount,
          unlockKey: fields.unlock_key,
          proofHash: fields.proof_hash,
          state: fields.state
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get escrow details:', error);
      return null;
    }
  }

  /**
   * Get all escrows for a user
   */
  async getUserEscrows(userAddress) {
    try {
      const objects = await this.suiClient.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::simple_escrow::Escrow`
        },
        options: {
          showContent: true,
          showType: true
        }
      });

      return objects.data.map(obj => {
        if (obj.data?.content?.dataType === 'moveObject') {
          const fields = obj.data.content.fields;
          return {
            id: obj.data.objectId,
            sender: fields.sender,
            vendor: fields.vendor,
            verifier: fields.verifier,
            amount: fields.amount,
            unlockKey: fields.unlock_key,
            proofHash: fields.proof_hash,
            state: fields.state
          };
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      console.error('Failed to get user escrows:', error);
      return [];
    }
  }
}

/**
 * Utility functions for Sui integration
 */
export const SuiUtils = {
  /**
   * Format Sui address for display
   */
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  /**
   * Convert amount to MIST (smallest Sui unit)
   */
  toMist(suiAmount) {
    return Math.floor(suiAmount * 1_000_000_000);
  },

  /**
   * Convert MIST to SUI
   */
  fromMist(mistAmount) {
    return mistAmount / 1_000_000_000;
  },

  /**
   * Generate a unique unlock key for escrow
   */
  generateUnlockKey(orderId) {
    return `order-${orderId}-${Date.now()}`;
  },

  /**
