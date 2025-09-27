const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderID: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  senderID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: { type: [OrderItemSchema], required: true },
  totalPrice: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'received', 'prepared', 'proof_uploaded', 'verified', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  shippingInternational: { type: Boolean, default: false },
  recipientName: { type: String },
  recipientPhone: { type: String },
  recipientAddress: { type: String },
  trustlessSwapID: { type: String },
  proofOfPackaging: { type: String },
  verificationSignature: { type: String },
  verifiedBy: { type: String }, // logistics pubkey or id
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
