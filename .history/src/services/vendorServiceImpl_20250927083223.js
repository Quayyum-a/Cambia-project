// services/impl/vendorServiceImpl.js
const VendorService = require('./vendorService');
const ProductService = require('./productServiceImpl');
const Status = require('../models/Status');
const { supabaseService } = require('../db/supabaseClient');

class VendorServiceImpl extends VendorService {
  async addProduct(vendorId, productData) {
    return await ProductService.createProduct(vendorId, productData);
  }

  async updateProductStock(vendorId, productId, newQuantity) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const { data, error } = await supabaseService
      .from('products')
      .update({ quantity_available: newQuantity })
      .eq('id', productId)
      .eq('vendor_id', vendorId)
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return await ProductService.updateStock(productId, newQuantity);
  }

  async updateProductPrice(vendorId, productId, newPrice) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const { data, error } = await supabaseService
      .from('products')
      .update({ price: newPrice })
      .eq('id', productId)
      .eq('vendor_id', vendorId)
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return await ProductService.updatePrice(productId, newPrice);
  }

  async deleteProduct(vendorId, productId) {
    return await ProductService.deleteProduct(productId, vendorId);
  }

  async getVendorProducts(vendorId) {
    return await ProductService.getVendorProducts(vendorId);
  }

  async receiveOrder(vendorId, orderId) {
    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('orders')
        .update({ status: Status.RECEIVED })
        .eq('id', orderId)
        .eq('vendor_id', vendorId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return { ...data, _id: data.id };
    }
    const order = await Order.findOne({ _id: orderId, vendorID: vendorId });
    if (!order) throw new Error('Order not found or not assigned to vendor');
    order.status = 'received';
    return await order.save();
  }

  async prepareGoods(vendorId, orderId) {
    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('orders')
        .update({ status: Status.PREPARED })
        .eq('id', orderId)
        .eq('vendor_id', vendorId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return { ...data, _id: data.id };
    }
    const order = await Order.findOne({ _id: orderId, vendorID: vendorId });
    if (!order) throw new Error('Order not found or not assigned to vendor');
    order.status = 'prepared';
    return await order.save();
  }

  async uploadProof(vendorId, orderId, proofCid) {
    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('orders')
        .update({ proof_of_packaging: proofCid, status: Status.PROOF_UPLOADED })
        .eq('id', orderId)
        .eq('vendor_id', vendorId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return { ...data, _id: data.id };
    }
    const order = await Order.findOne({ _id: orderId, vendorID: vendorId });
    if (!order) throw new Error('Order not found or not assigned to vendor');
    order.proofOfPackaging = proofCid;
    order.status = 'proof_uploaded';
    return await order.save();
  }
}

module.exports = new VendorServiceImpl();
