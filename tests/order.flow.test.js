const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const OrderService = require('../src/services/orderServiceImpl');
const VendorService = require('../src/services/vendorServiceImpl');
const Vendor = require('../src/models/Vendor');
const Sender = require('../src/models/Sender');
const Product = require('../src/models/Product');

let mongo;

describe('Order flow integration (up to proof upload)', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });
  afterEach(async () => { await mongoose.connection.db.dropDatabase(); });

  test('create order -> vendor receive -> prepare -> proof upload', async () => {
    const sender = await Sender.create({ firstName: 'John', lastName: 'Doe', email: 's@example.com', phone: '1', password: 'x', walletAddress: '0x' + '1'.repeat(64), address: 'US', role: 'sender' });
    const vendor = await Vendor.create({ firstName: 'Ada', lastName: 'Vendor', email: 'v@example.com', phone: '2', password: 'y', walletAddress: '0x' + '2'.repeat(64), address: 'NG', role: 'vendor' });
    const p1 = await Product.create({ name: 'Beans', description: '', price: 300, quantityAvailable: 10, unit: 'kg', vendor: vendor.id });

    const order = await OrderService.createOrder(sender.id, vendor.id, [{ product: p1.id, quantity: 2 }], { recipientName: 'Mum', recipientPhone: '0803', recipientAddress: 'Lagos' });
    expect(order.totalPrice).toBe(600);

    const r = await VendorService.receiveOrder(vendor.id, order.id);
    expect(r.status).toBe('received');
    const prep = await VendorService.prepareGoods(vendor.id, order.id);
    expect(prep.status).toBe('prepared');
    const proof = await VendorService.uploadProof(vendor.id, order.id, 'bafkrei...cid');
    expect(proof.status).toBe('proof_uploaded');
  });
});
