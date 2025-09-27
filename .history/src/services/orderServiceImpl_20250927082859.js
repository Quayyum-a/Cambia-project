const OrderService = require('./orderService');
const Status = require('../models/Status');
const { releaseEscrow } = require('../sui/suiIntegration');
const { verifyMessage } = require('../sui/verify');
const { supabaseService } = require('../db/supabaseClient');

class OrderServiceImpl extends OrderService {
  async createOrder(senderId, vendorId, items, meta = {}) {
    if (!Array.isArray(items) || items.length === 0) throw new Error('Items required');

    // Demo mode: Skip database validation for demo products
    const isDemoMode = !supabaseService && !this.mongodbUri;
    if (isDemoMode) {
      console.log('🎯 Demo mode: Creating order without database validation');
      let total = 0;
      const expanded = items.map(item => ({
        product: item.product,
        name: `Demo Product ${item.product.slice(-4)}`,
        price: 2500, // Demo price
        quantity: item.quantity
      }));
      total = expanded.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const order = {
        _id: `demo_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderID: senderId,
        vendorID: vendorId,
        items: expanded,
        totalPrice: total,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('✅ Demo order created:', order._id);
      return order;
    }

    if (useSupabase && supabaseService) {
      // Fetch products and compute total
      let total = 0;
      const expanded = [];
      for (const it of items) {
        const { data: p, error } = await supabaseService.from('products').select('*').eq('id', it.product).single();
        if (error || !p) throw new Error('Product not found');
        if (p.vendor_id !== vendorId) throw new Error('Product not from vendor');
        if (it.quantity <= 0) throw new Error('Invalid quantity');
        if (p.quantity_available < it.quantity) throw new Error('Insufficient stock');
        expanded.push({ product_id: p.id, name: p.name, price: Number(p.price), quantity: it.quantity });
        total += Number(p.price) * it.quantity;
      }
      const { data: order, error: errOrder } = await supabaseService
        .from('orders')
        .insert({ sender_id: senderId, vendor_id: vendorId, status: Status.PENDING, total_price: total, trustless_swap_id: null, proof_of_packaging: null })
        .select('*')
        .single();
      if (errOrder) throw new Error(errOrder.message);
      const itemsRows = expanded.map((it) => ({ order_id: order.id, product_id: it.product_id, name: it.name, price: it.price, quantity: it.quantity }));
      const { error: errItems } = await supabaseService.from('order_items').insert(itemsRows);
      if (errItems) throw new Error(errItems.message);
      return { ...order, _id: order.id, items: expanded, totalPrice: total };
    }

    // Mongo fallback
    const expanded = [];
    let total = 0;
    for (const it of items) {
      const p = await Product.findById(it.product);
      if (!p) throw new Error('Product not found');
      if (p.vendor.toString() !== vendorId.toString()) throw new Error('Product not from vendor');
      if (it.quantity <= 0) throw new Error('Invalid quantity');
      if (p.quantityAvailable < it.quantity) throw new Error('Insufficient stock');
      expanded.push({ product: p._id, name: p.name, price: p.price, quantity: it.quantity });
      total += p.price * it.quantity;
    }

    const order = await Order.create({
      senderID: senderId,
      vendorID: vendorId,
      items: expanded,
      totalPrice: total,
      status: Status.PENDING,
      shippingInternational: Boolean(meta.shippingInternational),
      recipientName: meta.recipientName || '',
      recipientPhone: meta.recipientPhone || '',
      recipientAddress: meta.recipientAddress || '',
    });

    return order;
  }

  async setEscrowId(orderId, escrowId) {
    // Demo mode: Just return success for demo orders
    const isDemoMode = !supabaseService && !this.mongodbUri;
    if (isDemoMode) {
      console.log('🎯 Demo mode: Setting escrow ID for demo order:', orderId, escrowId);
      return { _id: orderId, escrowId };
    }

    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('orders')
        .update({ trustless_swap_id: escrowId })
        .eq('id', orderId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return { ...data, _id: data.id };
    }
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.trustlessSwapID = escrowId;
    await order.save();
    return order;
  }

  async verifyAndRelease(orderId, verifierPubKey, payload, signature) {
    if (useSupabase && supabaseService) {
      const { data: order, error: errGet } = await supabaseService.from('orders').select('*').eq('id', orderId).single();
      if (errGet || !order) throw new Error('Order not found');
      if (!order.proof_of_packaging) throw new Error('No proof uploaded');
      const ok = await verifyMessage(verifierPubKey, payload, signature);
      if (!ok) throw new Error('Invalid verification signature');
      const { data: updated, error: errUpd } = await supabaseService
        .from('orders')
        .update({ status: Status.VERIFIED, verified_by: verifierPubKey, verification_signature: signature })
        .eq('id', orderId)
        .select('*')
        .single();
      if (errUpd) throw new Error(errUpd.message);
      try {
        if (!updated.trustless_swap_id) throw new Error('Missing escrow id');
        await releaseEscrow(updated.trustless_swap_id);
        return { ...updated, _id: updated.id };
      } catch (e) {
        await supabaseService
          .from('orders')
          .update({ status: Status.PROOF_UPLOADED })
          .eq('id', orderId);
        const err = new Error('On-chain release failed: ' + e.message);
        err.status = 502;
        throw err;
      }
    }

    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (!order.proofOfPackaging) throw new Error('No proof uploaded');

    const ok = await verifyMessage(verifierPubKey, payload, signature);
    if (!ok) throw new Error('Invalid verification signature');

    // Update state to verified first
    order.verifiedBy = verifierPubKey;
    order.verificationSignature = signature;
    order.status = Status.VERIFIED;
    await order.save();

    // Trigger on-chain release (best-effort with error handling)
    try {
      if (!order.trustlessSwapID) throw new Error('Missing escrow id');
      await releaseEscrow(order.trustlessSwapID);
      return order;
    } catch (e) {
      // If chain call fails, revert status back to proof_uploaded and surface error
      order.status = Status.PROOF_UPLOADED;
      await order.save();
      const err = new Error('On-chain release failed: ' + e.message);
      err.status = 502;
      throw err;
    }
  }

  async refund(orderId, reason = '') {
    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('orders')
        .update({ status: Status.REFUNDED })
        .eq('id', orderId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return { ...data, _id: data.id };
    }
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.status = Status.REFUNDED;
    await order.save();
    return order;
  }
}

module.exports = new OrderServiceImpl();


module.exports = new OrderServiceImpl();
