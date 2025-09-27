// Demo Escrow Service for Cambia Marketplace
// Simulates blockchain escrow contract interactions for demo purposes

class DemoEscrowService {
  constructor() {
    this.escrows = new Map();
    this.transactions = [];
  }

  // Create a new escrow (simulates smart contract deployment)
  async createEscrow(senderAddress, vendorAddress, verifierAddress, amount, unlockKey) {
    const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const escrow = {
      id: escrowId,
      sender: senderAddress,
      vendor: vendorAddress,
      verifier: verifierAddress,
      amount: amount,
      unlockKey: unlockKey,
      state: 'CREATED', // CREATED, PROOF_UPLOADED, COMPLETED, CANCELLED
      proofHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      transactions: []
    };

    this.escrows.set(escrowId, escrow);

    // Simulate blockchain transaction
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    this.transactions.push({
      hash: txHash,
      type: 'CREATE_ESCROW',
      escrowId,
      amount,
      timestamp: new Date(),
      status: 'CONFIRMED'
    });

    console.log(`🎯 Demo Escrow Created: ${escrowId}`);
    console.log(`📤 Sender: ${senderAddress}`);
    console.log(`🏪 Vendor: ${vendorAddress}`);
    console.log(`🔐 Verifier: ${verifierAddress}`);
    console.log(`💰 Amount: ₦${amount}`);
    console.log(`🔑 Unlock Key: ${unlockKey}`);

    return {
      escrowId,
      transactionHash: txHash,
      status: 'success'
    };
  }

  // Vendor uploads proof (simulates IPFS upload and contract update)
  async uploadProof(vendorAddress, escrowId, proofHash) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.vendor !== vendorAddress) throw new Error('Unauthorized vendor');
    if (escrow.state !== 'CREATED') throw new Error('Invalid escrow state');

    escrow.proofHash = proofHash;
    escrow.state = 'PROOF_UPLOADED';
    escrow.updatedAt = new Date();

    // Simulate blockchain transaction
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    this.transactions.push({
      hash: txHash,
      type: 'UPLOAD_PROOF',
      escrowId,
      proofHash,
      timestamp: new Date(),
      status: 'CONFIRMED'
    });

    console.log(`📦 Proof Uploaded for Escrow: ${escrowId}`);
    console.log(`🔗 IPFS Hash: ${proofHash}`);
    console.log(`📊 New State: PROOF_UPLOADED`);

    return {
      transactionHash: txHash,
      status: 'success'
    };
  }

  // Verifier verifies and releases funds (simulates contract verification)
  async verifyAndRelease(verifierAddress, escrowId, providedKey) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.verifier !== verifierAddress) throw new Error('Unauthorized verifier');
    if (escrow.state !== 'PROOF_UPLOADED') throw new Error('Invalid escrow state');
    if (escrow.unlockKey !== providedKey) throw new Error('Invalid unlock key');

    escrow.state = 'COMPLETED';
    escrow.updatedAt = new Date();

    // Simulate blockchain transaction
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    this.transactions.push({
      hash: txHash,
      type: 'VERIFY_AND_RELEASE',
      escrowId,
      amount: escrow.amount,
      timestamp: new Date(),
      status: 'CONFIRMED'
    });

    console.log(`✅ Escrow Verified and Released: ${escrowId}`);
    console.log(`🔑 Unlock Key Verified: ${providedKey}`);
    console.log(`💰 Amount Released: ₦${escrow.amount}`);
    console.log(`🏦 Funds transferred to vendor: ${escrow.vendor}`);

    return {
      transactionHash: txHash,
      amount: escrow.amount,
      status: 'success'
    };
  }

  // Cancel escrow and refund sender
  async cancelEscrow(senderAddress, escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.sender !== senderAddress) throw new Error('Unauthorized sender');
    if (escrow.state !== 'CREATED') throw new Error('Cannot cancel escrow in current state');

    escrow.state = 'CANCELLED';
    escrow.updatedAt = new Date();

    // Simulate blockchain transaction
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    this.transactions.push({
      hash: txHash,
      type: 'CANCEL_ESCROW',
      escrowId,
      amount: escrow.amount,
      timestamp: new Date(),
      status: 'CONFIRMED'
    });

    console.log(`❌ Escrow Cancelled: ${escrowId}`);
    console.log(`💸 Refunded to sender: ${escrow.sender}`);
    console.log(`📊 Final State: CANCELLED`);

    return {
      transactionHash: txHash,
      refundAmount: escrow.amount,
      status: 'success'
    };
  }

  // Get escrow details
  getEscrow(escrowId) {
    return this.escrows.get(escrowId);
  }

  // Get all escrows for an address
  getEscrowsByAddress(address) {
    return Array.from(this.escrows.values()).filter(
      escrow => escrow.sender === address || escrow.vendor === address || escrow.verifier === address
    );
  }

  // Get transaction history
  getTransactionHistory(escrowId = null) {
    if (escrowId) {
      return this.transactions.filter(tx => tx.escrowId === escrowId);
    }
    return this.transactions;
  }

  // Demo data for investor presentations
  createDemoScenario() {
    console.log('🎬 Creating Demo Scenario for Investor Presentation');

    // Create demo addresses
    const senderAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const vendorAddress = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const verifierAddress = '0x1111111111111111111111111111111111111111111111111111111111111111';

    // Create escrow
    this.createEscrow(senderAddress, vendorAddress, verifierAddress, 5000, 'demo-unlock-key-123');

    // Simulate proof upload
    setTimeout(() => {
      this.uploadProof(vendorAddress, Array.from(this.escrows.keys())[0], 'QmDemoProofHash123456789');
    }, 2000);

    // Simulate verification
    setTimeout(() => {
      this.verifyAndRelease(verifierAddress, Array.from(this.escrows.keys())[0], 'demo-unlock-key-123');
    }, 4000);

    return {
      senderAddress,
      vendorAddress,
      verifierAddress,
      escrowId: Array.from(this.escrows.keys())[0]
    };
  }

  // Reset demo data
  reset() {
    this.escrows.clear();
    this.transactions = [];
    console.log('🔄 Demo escrow service reset');
  }
}

module.exports = new DemoEscrowService();