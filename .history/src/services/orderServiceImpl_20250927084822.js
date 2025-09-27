const OrderService = require('./orderService');
const Status = require('../models/Status');
const { releaseEscrow } = require('../sui/suiIntegration');
const { verifyMessage } = require('../sui/verify');
const { supabaseService } = require('../db/supabaseClient');

class OrderServiceImpl extends OrderService {
  async createOrder(senderId, vendorId, items, meta = {}) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables in your deployment platform (Railway).');
    }

    if (!Array.isArray(items) || items.length === 0) throw new Error('Items required');

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
      .insert({
        sender_id: senderId,
        vendor_id: vendorId,
        status: Status.PENDING,
        total_price: total,
        trustless_swap_id: null,
        proof_of_packaging: null
      })
      .select('*')
      .single();

    if (errOrder) throw new Error(errOrder.message);

    const itemsRows = expanded.map((it) => ({
      order_id: order.id,
      product_id: it.product_id,
      name: it.name,
      price: it.price,
      quantity: it.quantity
    }));

    const { error: errItems } = await supabaseService.from('order_items').insert(itemsRows);
    if (errItems) throw new Error(errItems.message);

    return { ...order, _id: order.id, items: expanded, totalPrice: total };
  }

  async setEscrowId(orderId, escrowId) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables in your deployment platform (Railway).');
    }

    const { data, error } = await supabaseService
      .from('orders')
      .update({ trustless_swap_id: escrowId })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return { ...data, _id: data.id };
  }

  async verifyAndRelease(orderId, verifierPubKey, payload, signature) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables in your deployment platform (Railway).');
    }

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

  async refund(orderId, reason = '') {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables in your deployment platform (Railway).');
    }

    const { data, error } = await supabaseService
      .from('orders')
      .update({ status: Status.REFUNDED })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return { ...data, _id: data.id };
  }
}

module.exports = new OrderServiceImpl();
