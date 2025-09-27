class OrderService {
  async createOrder(senderId, vendorId, items, meta) { throw new Error('Not implemented'); }
  async setEscrowId(orderId, escrowId) { throw new Error('Not implemented'); }
  async verifyAndRelease(orderId, verifierPubKey, payload, signature) { throw new Error('Not implemented'); }
  async refund(orderId, reason) { throw new Error('Not implemented'); }
}

module.exports = OrderService;
