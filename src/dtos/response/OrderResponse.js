class OrderResponse {
  static from(order, vendor) {
    return {
      id: order.id,
      vendor: vendor ? { id: vendor.id, name: vendor.firstName + ' ' + vendor.lastName } : order.vendorID,
      products: order.items.map(i => ({ id: i.product, name: i.name, price: i.price, quantity: i.quantity })),
      status: { code: order.status, label: order.status.replace(/_/g, ' ') },
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
    };
  }
}

module.exports = OrderResponse;
