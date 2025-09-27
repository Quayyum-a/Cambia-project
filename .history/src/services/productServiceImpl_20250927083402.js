const ProductService = require('./productService');
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
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

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

  async updateStock(productId, newQuantity) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const { data, error } = await supabaseService
      .from('products')
      .update({ quantity_available: newQuantity })
      .eq('id', productId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapRowToProduct(data);
  }

  async updatePrice(productId, newPrice) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const { data, error } = await supabaseService
      .from('products')
      .update({ price: newPrice })
      .eq('id', productId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapRowToProduct(data);
  }

  async getVendorProducts(vendorId) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const { data, error } = await supabaseService
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRowToProduct);
  }

  async deleteProduct(productId, vendorId) {
    if (!supabaseService) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

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
}

module.exports = new ProductServiceImpl();
