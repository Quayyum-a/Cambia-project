const ProductService = require('./productService');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { useSupabase } = require('../config/env');
const { supabaseService } = require('../db/supabaseClient');

function mapRowToProduct(row) {
  return {
    _id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    unit: row.unit,
    quantityAvailable: row.quantity_available,
    vendor: row.vendor_id,
    createdAt: row.created_at,
  };
}

class ProductServiceImpl extends ProductService {
  async createProduct(vendorId, productData) {
    if (useSupabase && supabaseService) {
      const payload = {
        vendor_id: vendorId,
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        unit: productData.unit,
        quantity_available: productData.quantityAvailable ?? 0,
      };
      const { data, error } = await supabaseService.from('products').insert(payload).select('*').single();
      if (error) throw new Error(error.message);
      return mapRowToProduct(data);
    }
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new Error('Vendor not found');
    const product = new Product({ ...productData, vendor: vendorId });
    return await product.save();
  }

  async updateStock(productId, newQuantity) {
    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('products')
        .update({ quantity_available: newQuantity })
        .eq('id', productId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return mapRowToProduct(data);
    }
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    product.quantityAvailable = newQuantity;
    return await product.save();
  }

  async updatePrice(productId, newPrice) {
    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('products')
        .update({ price: newPrice })
        .eq('id', productId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return mapRowToProduct(data);
    }
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    product.price = newPrice;
    return await product.save();
  }

  async getVendorProducts(vendorId) {
    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map(mapRowToProduct);
    }
    return await Product.find({ vendor: vendorId });
  }

  async deleteProduct(productId, vendorId) {
    if (useSupabase && supabaseService) {
      const { data, error } = await supabaseService
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('vendor_id', vendorId)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return mapRowToProduct(data);
    }
    const product = await Product.findOneAndDelete({ _id: productId, vendor: vendorId });
    if (!product) throw new Error('Product not found or not owned by vendor');
    return product;
  }
}

module.exports = new ProductServiceImpl();
