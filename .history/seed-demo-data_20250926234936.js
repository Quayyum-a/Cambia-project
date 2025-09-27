// Seed demo data for Cambia Marketplace
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Vendor = require('./src/models/Vendor');
const User = require('./src/models/User');

async function seedDemoData() {
  try {
    // Connect to MongoDB (will use in-memory server in demo mode)
    await mongoose.connect('mongodb://localhost:27017/cambia', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🌱 Seeding demo data...');

    // Create demo vendor user
    const demoVendor = new User({
      firstName: 'Lagos',
      lastName: 'Fresh Foods',
      email: 'vendor@lagosfoods.com',
      password: 'hashedpassword', // Not used in demo
      role: 'vendor',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    });

    const savedVendor = await demoVendor.save();
    console.log('✅ Created demo vendor:', savedVendor._id);

    // Create demo products
    const demoProducts = [
      {
        name: 'Premium Rice',
        description: 'High-quality Nigerian rice, perfect for jollof rice and other traditional dishes',
        price: 2500,
        unit: 'kg',
        quantityAvailable: 50,
        vendor: savedVendor._id
      },
      {
        name: 'Palm Oil',
        description: 'Pure red palm oil from Nigerian farms, essential for authentic cooking',
        price: 2500,
        unit: 'liter',
        quantityAvailable: 30,
        vendor: savedVendor._id
      },
      {
        name: 'Groundnut Oil',
        description: 'Freshly extracted groundnut oil, healthy and delicious',
        price: 3000,
        unit: 'liter',
        quantityAvailable: 25,
        vendor: savedVendor._id
      },
      {
        name: 'Egusi Seeds',
        description: 'Premium egusi seeds for making traditional Nigerian soups',
        price: 1500,
        unit: 'kg',
        quantityAvailable: 40,
        vendor: savedVendor._id
      },
      {
        name: 'Dried Fish',
        description: 'Sun-dried fish from the Niger Delta, perfect for soups',
        price: 4000,
        unit: 'kg',
        quantityAvailable: 15,
        vendor: savedVendor._id
      },
      {
        name: 'Garri',
        description: 'Premium cassava flakes, instant and ready to eat',
        price: 1200,
        unit: 'kg',
        quantityAvailable: 60,
        vendor: savedVendor._id
      }
    ];

    for (const productData of demoProducts) {
      const product = new Product(productData);
      await product.save();
