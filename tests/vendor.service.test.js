const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const VendorService = require('../src/services/vendorServiceImpl');
const Product = require('../src/models/Product');
const Vendor = require('../src/models/Vendor');

let mongo;

describe('VendorService', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test('create product, update stock and price', async () => {
    const vendor = await Vendor.create({
      firstName: 'Ada', lastName: 'Vendor', email: 'v@example.com', phone: '0803', password: 'hashed', walletAddress: '0x' + 'a'.repeat(64), address: 'NG', role: 'vendor'
    });

    const product = await VendorService.addProduct(vendor.id, { name: 'Yam', description: 'Fresh', price: 1000, quantityAvailable: 5, unit: 'kg' });
    expect(product.name).toBe('Yam');

    const stock = await VendorService.updateProductStock(vendor.id, product.id, 10);
    expect(stock.quantityAvailable).toBe(10);

    const price = await VendorService.updateProductPrice(vendor.id, product.id, 1200);
    expect(price.price).toBe(1200);

    const mine = await VendorService.getVendorProducts(vendor.id);
    expect(mine).toHaveLength(1);
  });

  test('receive, prepare, upload proof on order', async () => {
    const vendor = await Vendor.create({
      firstName: 'Ada', lastName: 'Vendor', email: 'v2@example.com', phone: '0803', password: 'hashed', walletAddress: '0x' + 'b'.repeat(64), address: 'NG', role: 'vendor'
    });
    const product = await Product.create({ name: 'Garri', description: '', price: 500, quantityAvailable: 2, unit: 'kg', vendor: vendor.id });

    const Order = require('../src/models/Order');
    const order = await Order.create({ senderID: new mongoose.Types.ObjectId(), vendorID: vendor.id, items: [{ product: product.id, name: product.name, price: product.price, quantity: 1 }], totalPrice: 500 });

    const received = await VendorService.receiveOrder(vendor.id, order.id);
    expect(received.status).toBe('received');

    const prepared = await VendorService.prepareGoods(vendor.id, order.id);
    expect(prepared.status).toBe('prepared');

    const proofed = await VendorService.uploadProof(vendor.id, order.id, 'bafy...cid');
    expect(proofed.status).toBe('proof_uploaded');
    expect(proofed.proofOfPackaging).toBe('bafy...cid');
  });
});
