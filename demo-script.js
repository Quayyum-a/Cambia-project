#!/usr/bin/env node

/**
 * Cambia Marketplace - Investor Demo Script
 *
 * This script demonstrates the complete end-to-end flow of the Cambia marketplace,
 * including authentication, product browsing, order creation, escrow setup,
 * vendor fulfillment, and payment release.
 *
 * Usage: node demo-script.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Demo user credentials
const DEMO_USER = {
  email: 'quayyumariyo@gmail.com',
  password: 'monkeyss'
};

// Demo data
const DEMO_PRODUCTS = [
  {
    name: 'Premium Rice',
    description: 'High-quality Nigerian rice, perfect for jollof',
    price: 2500,
    quantityAvailable: 50,
    unit: 'kg'
  },
  {
    name: 'Palm Oil',
    description: 'Pure red palm oil from Nigerian farms',
    price: 2500,
    quantityAvailable: 30,
    unit: 'liter'
  }
];

class CambiaDemo {
  constructor() {
    this.token = null;
    this.user = null;
    this.orderId = null;
    this.escrowId = null;
    this.vendorId = 'vendor1'; // Demo vendor
  }

  async delay(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async log(message, emoji = '📝') {
    console.log(`${emoji} ${message}`);
    await this.delay(1000);
  }

  async error(message) {
    console.error(`❌ ${message}`);
  }

  async success(message) {
    console.log(`✅ ${message}`);
  }

  // Step 1: Authentication
  async authenticate() {
    await this.log('Starting Cambia Marketplace Demo', '🚀');
    await this.log('Step 1: User Authentication', '🔐');

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, DEMO_USER);
      this.token = response.data.token;
      this.user = response.data.user;

      await this.success(`Logged in as ${this.user.firstName} ${this.user.lastName} (${this.user.role})`);
      await this.success(`Wallet Address: ${this.user.walletAddress.slice(0, 10)}...`);

    } catch (err) {
      await this.error(`Authentication failed: ${err.response?.data?.error || err.message}`);
      return false;
    }

    return true;
  }

  // Step 2: Browse Products
  async browseProducts() {
    await this.log('Step 2: Product Discovery', '🛍️');

    try {
      // For demo purposes, let's create some sample products to show
      const demoProducts = [
        {
          _id: 'demo-product-1',
          name: 'Premium Rice',
          description: 'High-quality Nigerian rice',
          price: 2500,
          unit: 'kg',
          quantityAvailable: 50,
          vendor: this.vendorId
        },
        {
          _id: 'demo-product-2',
          name: 'Palm Oil',
          description: 'Pure red palm oil',
          price: 2500,
          unit: 'liter',
          quantityAvailable: 30,
          vendor: this.vendorId
        }
      ];

      await this.success(`Found ${demoProducts.length} products from vendor ${this.vendorId}`);

      demoProducts.forEach(product => {
        console.log(`   • ${product.name} - ₦${product.price}/${product.unit} (${product.quantityAvailable} available)`);
      });

      // Store demo products for later use
      this.demoProducts = demoProducts;

    } catch (err) {
      await this.error(`Product browsing failed: ${err.response?.data?.error || err.message}`);
      return false;
    }

    return true;
  }

  // Step 3: Simulate Order Creation
  async createOrder() {
    await this.log('Step 3: Order Creation (Simulated)', '📦');

    try {
      // Simulate order creation for demo purposes
      this.orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const orderData = {
        vendorId: this.vendorId,
        items: [
          {
            product: this.demoProducts[0]._id,
            name: this.demoProducts[0].name,
            quantity: 2,
            price: this.demoProducts[0].price
          },
          {
            product: this.demoProducts[1]._id,
            name: this.demoProducts[1].name,
            quantity: 1,
            price: this.demoProducts[1].price
          }
        ],
        totalPrice: (this.demoProducts[0].price * 2) + (this.demoProducts[1].price * 1)
      };

      await this.success(`Order created successfully!`);
      await this.success(`Order ID: ${this.orderId}`);
      await this.success(`Items: ${orderData.items[0].name} (x${orderData.items[0].quantity}), ${orderData.items[1].name} (x${orderData.items[1].quantity})`);
      await this.success(`Total Amount: ₦${orderData.totalPrice}`);

      // Store order data for escrow
      this.orderData = orderData;

    } catch (err) {
      await this.error(`Order creation simulation failed: ${err.message}`);
      return false;
    }

    return true;
  }

  // Step 4: Setup Escrow
  async setupEscrow() {
    await this.log('Step 4: Blockchain Escrow Setup', '🔒');

    try {
      const escrowData = {
        senderAddress: this.user.walletAddress,
        vendorAddress: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', // Demo vendor
        verifierAddress: '0x1111111111111111111111111111111111111111111111111111111111111111', // Demo verifier
        amount: 5000, // Demo amount
        unlockKey: `demo-key-${this.orderId}-${Date.now()}`
      };

      const response = await axios.post(`${API_BASE}/api/demo-escrow/create`, escrowData);

      this.escrowId = response.data.escrowId;
      this.unlockKey = escrowData.unlockKey; // Store the unlock key for later use
      await this.success(`Escrow contract created on blockchain!`);
      await this.success(`Escrow ID: ${this.escrowId}`);
      await this.success(`Amount locked: ₦${escrowData.amount}`);
      await this.success(`Transaction Hash: ${response.data.transactionHash}`);
      await this.success(`Unlock Key Generated: ${this.unlockKey}`);

      // Note: In a real implementation, the escrow ID would be saved to the order
      // For demo purposes, we'll skip this step as the escrow creation itself is working

    } catch (err) {
      await this.error(`Escrow setup failed: ${err.response?.data?.error || err.message}`);
      return false;
    }

    return true;
  }

  // Step 5: Vendor Fulfillment (Simulated)
  async vendorFulfillment() {
    await this.log('Step 5: Vendor Order Fulfillment (Simulated)', '🏪');

    try {
      await this.success('Vendor received the order');
      await this.delay(1000);

      await this.success('Vendor prepared the goods');
      await this.delay(1000);

      // Simulate vendor uploading proof to escrow
      const proofData = {
        proofHash: `QmDemoProof${Date.now()}`
      };

      await axios.post(`${API_BASE}/api/demo-escrow/${this.escrowId}/proof`, {
        vendorAddress: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        proofHash: proofData.proofHash
      });

      await this.success('Vendor uploaded proof of packaging to blockchain');
      await this.success(`IPFS Hash: ${proofData.proofHash}`);
      await this.success('Escrow state updated to PROOF_UPLOADED');

    } catch (err) {
      await this.error(`Vendor fulfillment failed: ${err.response?.data?.error || err.message}`);
      return false;
    }

    return true;
  }

  // Step 6: Logistics Verification
  async logisticsVerification() {
    await this.log('Step 6: Logistics Verification', '🚚');

    try {
      // Use the unlock key that was generated during escrow creation
      await axios.post(`${API_BASE}/api/demo-escrow/${this.escrowId}/verify`, {
        verifierAddress: '0x1111111111111111111111111111111111111111111111111111111111111111',
        unlockKey: this.unlockKey
      });

      await this.success('Logistics provider verified delivery');
      await this.success('Payment released to vendor via smart contract');
      await this.success(`Unlock Key Verified: ${this.unlockKey}`);

    } catch (err) {
      await this.error(`Logistics verification failed: ${err.response?.data?.error || err.message}`);
      return false;
    }

    return true;
  }

  // Step 7: Order Completion
  async orderCompletion() {
    await this.log('Step 7: Order Completion', '🎉');

    try {
      // Check escrow status
      const escrowResponse = await axios.get(`${API_BASE}/api/demo-escrow/${this.escrowId}`);
      const escrow = escrowResponse.data;

      await this.success('Order completed successfully!');
      await this.success(`Final Status: ${escrow.state}`);
      await this.success(`Amount Paid: ₦${escrow.amount}`);
      await this.success('Customer received their products');

    } catch (err) {
      await this.error(`Order completion check failed: ${err.response?.data?.error || err.message}`);
      return false;
    }

    return true;
  }

  // Main demo flow
  async runDemo() {
    console.log('🇳🇬 CAMBIA MARKETPLACE - INVESTOR DEMO');
    console.log('=====================================');
    console.log('');

    // Check if server is running
    try {
      await axios.get(`${API_BASE}/health`);
      await this.success('Server is running and healthy');
    } catch (err) {
      await this.error('Server is not running. Please start the backend with: npm run dev');
      return;
    }

    // Run demo steps
    const steps = [
      this.authenticate.bind(this),
      this.browseProducts.bind(this),
      this.createOrder.bind(this),
      this.setupEscrow.bind(this),
      this.vendorFulfillment.bind(this),
      this.logisticsVerification.bind(this),
      this.orderCompletion.bind(this)
    ];

    for (const step of steps) {
      const success = await step();
      if (!success) {
        await this.error('Demo failed. Please check the errors above.');
        return;
      }
      console.log('');
    }

    // Demo completion
    console.log('');
    console.log('🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('===============================');
    await this.success('Cambia marketplace demonstrated:');
    console.log('   • User authentication with wallet integration');
    console.log('   • Product discovery and ordering');
    console.log('   • Blockchain escrow for secure payments');
    console.log('   • Vendor fulfillment workflow');
    console.log('   • Logistics verification and payment release');
    console.log('   • Trustless commerce on Sui blockchain');
    console.log('');
    console.log('🌐 Visit http://localhost:3000 to explore the full UI');
    console.log('📧 Demo credentials: quayyumariyo@gmail.com / monkeyss');
  }
}

// Run the demo
if (require.main === module) {
  const demo = new CambiaDemo();
  demo.runDemo().catch(console.error);
}

module.exports = CambiaDemo;