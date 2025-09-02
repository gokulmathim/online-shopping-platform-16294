'use strict';
const {
  ensureOrderTables,
  getOrCreateActiveCart,
  getCartWithItems,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  createOrderFromCart,
  getOrderById,
  listOrders,
  recordPayment,
  markOrderPaid,
} = require('../models/orderModel');

/**
 * PUBLIC_INTERFACE
 * Initialize cart/order/payment tables.
 */
async function init() {
  await ensureOrderTables();
}

/**
 * PUBLIC_INTERFACE
 * Get active cart for a user with line items.
 */
async function getActiveCart(userId) {
  const cart = await getOrCreateActiveCart(userId);
  const items = await getCartWithItems(cart.id);
  return { cartId: cart.id, items };
}

/**
 * PUBLIC_INTERFACE
 * Add item to cart.
 */
async function addToCart(userId, productId, quantity) {
  const cart = await getOrCreateActiveCart(userId);
  const item = await addItem(cart.id, productId, quantity);
  const items = await getCartWithItems(cart.id);
  return { cartId: cart.id, item, items };
}

/**
 * PUBLIC_INTERFACE
 * Update item quantity in cart.
 */
async function updateCartItem(userId, productId, quantity) {
  const cart = await getOrCreateActiveCart(userId);
  const item = await updateItem(cart.id, productId, quantity);
  const items = await getCartWithItems(cart.id);
  return { cartId: cart.id, item, items };
}

/**
 * PUBLIC_INTERFACE
 * Remove item from cart.
 */
async function removeFromCart(userId, productId) {
  const cart = await getOrCreateActiveCart(userId);
  await removeItem(cart.id, productId);
  const items = await getCartWithItems(cart.id);
  return { cartId: cart.id, items };
}

/**
 * PUBLIC_INTERFACE
 * Clear cart.
 */
async function clearUserCart(userId) {
  const cart = await getOrCreateActiveCart(userId);
  await clearCart(cart.id);
  return { cartId: cart.id, items: [] };
}

/**
 * PUBLIC_INTERFACE
 * Checkout: convert cart to order and perform mock payment.
 */
async function checkout(userId, { provider = 'mock', currency = 'USD' } = {}) {
  const cart = await getOrCreateActiveCart(userId);
  const order = await createOrderFromCart(userId, cart.id);

  // Mock payment processing succeeds
  const paymentRef = `PMT_${Date.now()}_${order.id}`;
  await recordPayment(order.id, provider, order.total, currency, 'succeeded', paymentRef);
  await markOrderPaid(order.id);

  const details = await getOrderById(order.id, userId);
  return { order: details, payment: { provider, reference: paymentRef, status: 'succeeded' } };
}

/**
 * PUBLIC_INTERFACE
 * Get order details.
 */
async function getOrder(userId, orderId) {
  return getOrderById(orderId, userId);
}

/**
 * PUBLIC_INTERFACE
 * List user orders.
 */
async function getOrders(userId, limit, offset) {
  return listOrders(userId, limit, offset);
}

module.exports = {
  init,
  getActiveCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearUserCart,
  checkout,
  getOrder,
  getOrders,
};
