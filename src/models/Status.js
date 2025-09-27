// src/models/OrderStatus.js

const Status = Object.freeze({
  PENDING: "pending",
  RECEIVED: "received",
  PREPARED: "prepared",
  PROOF_UPLOADED: "proof_uploaded",
  VERIFIED: "verified",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
});

module.exports = Status;
