'use strict';
const { query } = require('../config/db');

/**
 * PUBLIC_INTERFACE
 * Ensure cart, orders, and related tables exist.
 */
async function ensureOrderTables() {
  await query('\
    CREATE TABLE IF NOT EXISTS carts (\
      id SERIAL PRIMARY KEY,\
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,\
      status VARCHAR(20) NOT NULL DEFAULT \'active\', -- active, converted\
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),\
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()\
    );\
    CREATE TABLE IF NOT EXISTS cart_items (\
      id SERIAL PRIMARY KEY,\
      cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,\
      product_id INTEGER NOT NULL REFERENCES products(id),\
      quantity INTEGER NOT NULL CHECK (quantity > 0),\
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),\
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),\
      UNIQUE(cart_id, product_id)\
    );\
    CREATE TABLE IF NOT EXISTS orders (\
      id SERIAL PRIMARY KEY,\
      user_id INTEGER NOT NULL REFERENCES users(id),\
      total NUMERIC(12,2) NOT NULL,\
      status VARCHAR(30) NOT NULL DEFAULT \'pending\', -- pending, paid, shipped, delivered, canceled\
      payment_status VARCHAR(30) NOT NULL DEFAULT \'unpaid\', -- unpaid, paid, refunded\
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),\
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()\
    );\
    CREATE TABLE IF NOT EXISTS order_items (\
      id SERIAL PRIMARY KEY,\
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,\
      product_id INTEGER NOT NULL REFERENCES products(id),\
      name VARCHAR(255) NOT NULL,\
      price NUMERIC(12,2) NOT NULL,\
      quantity INTEGER NOT NULL CHECK (quantity > 0)\
    );\
    CREATE TABLE IF NOT EXISTS payments (\
      id SERIAL PRIMARY KEY,\
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,\
      provider VARCHAR(50) NOT NULL,\
      amount NUMERIC(12,2) NOT NULL,\
      currency VARCHAR(10) NOT NULL DEFAULT \'USD\',\
      status VARCHAR(30) NOT NULL, -- succeeded, failed\
      reference VARCHAR(255),\
      created_at TIMESTAMP NOT NULL DEFAULT NOW()\
    );\
    CREATE INDEX IF NOT EXISTS idx_carts_user ON carts (user_id);\
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);\
  ');
}

/**
 * PUBLIC_INTERFACE
 * Get or create active cart for a user.
 */
async function getOrCreateActiveCart(userId) {
  const { rows } = await query('SELECT * FROM carts WHERE user_id = $1 AND status = \'active\' LIMIT 1', [userId]);
  if (rows[0]) return rows[0];
  const { rows: created } = await query(
    'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return created[0];
}

/**
 * PUBLIC_INTERFACE
 * Get cart with items.
 */
async function getCartWithItems(cartId) {
  const { rows: items } = await query('\
    SELECT ci.id, ci.product_id, p.name, p.price, ci.quantity, p.image_url\
    FROM cart_items ci\
    JOIN products p ON p.id = ci.product_id\
    WHERE ci.cart_id = $1\
    ORDER BY ci.id ASC\
  ', [cartId]);
  return items;
}

/**
 * PUBLIC_INTERFACE
 * Add item to cart (upsert).
 */
async function addItem(cartId, productId, quantity) {
  const { rows } = await query('\
    INSERT INTO cart_items (cart_id, product_id, quantity)\
    VALUES ($1, $2, $3)\
    ON CONFLICT (cart_id, product_id)\
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()\
    RETURNING id, cart_id, product_id, quantity\
  ', [cartId, productId, quantity]);
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Update quantity for a cart item.
 */
async function updateItem(cartId, productId, quantity) {
  const { rows } = await query('\
    UPDATE cart_items\
    SET quantity = $3, updated_at = NOW()\
    WHERE cart_id = $1 AND product_id = $2\
    RETURNING id, cart_id, product_id, quantity\
  ', [cartId, productId, quantity]);
  return rows[0] || null;
}

/**
 * PUBLIC_INTERFACE
 * Remove item from cart.
 */
async function removeItem(cartId, productId) {
  await query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
  return true;
}

/**
 * PUBLIC_INTERFACE
 * Clear all items from a cart.
 */
async function clearCart(cartId) {
  await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  return true;
}

/**
 * PUBLIC_INTERFACE
 * Create order from an active cart and mark cart converted.
 */
async function createOrderFromCart(userId, cartId) {
  // compute line items and total
  const { rows: items } = await query('\
    SELECT p.id as product_id, p.name, p.price, ci.quantity\
    FROM cart_items ci\
    JOIN products p ON p.id = ci.product_id\
    WHERE ci.cart_id = $1\
  ', [cartId]);
  if (items.length === 0) {
    throw new Error('Cart is empty');
  }
  const total = items.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0);

  // Start transaction
  await query('BEGIN');
  try {
    const { rows: orderRows } = await query(
      'INSERT INTO orders (user_id, total, status, payment_status)\
       VALUES ($1, $2, \'pending\', \'unpaid\')\
       RETURNING *',
      [userId, total]
    );
    const order = orderRows[0];

    // Insert order items
    for (const it of items) {
      await query(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity)\
         VALUES ($1, $2, $3, $4, $5)',
        [order.id, it.product_id, it.name, it.price, it.quantity]
      );
      // Reduce stock
      await query('UPDATE products SET stock = stock - $2 WHERE id = $1', [it.product_id, it.quantity]);
    }

    // Mark cart converted and clear items
    await query('UPDATE carts SET status = \'converted\', updated_at = NOW() WHERE id = $1', [cartId]);
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await query('COMMIT');
    return order;
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * Get order details with items.
 */
async function getOrderById(orderId, userId) {
  const { rows: orders } = await query(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [orderId, userId]
  );
  const order = orders[0];
  if (!order) return null;
  const { rows: items } = await query(
    'SELECT id, product_id, name, price, quantity FROM order_items WHERE order_id = $1',
    [orderId]
  );
  order.items = items;
  return order;
}

/**
 * PUBLIC_INTERFACE
 * List orders for a user.
 */
async function listOrders(userId, limit = 20, offset = 0) {
  const { rows } = await query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Record a payment.
 */
async function recordPayment(orderId, provider, amount, currency, status, reference) {
  const { rows } = await query(
    'INSERT INTO payments (order_id, provider, amount, currency, status, reference)\
     VALUES ($1,$2,$3,$4,$5,$6)\
     RETURNING *',
    [orderId, provider, amount, currency, status, reference]
  );
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Update order and payment statuses after success.
 */
async function markOrderPaid(orderId) {
  await query('UPDATE orders SET payment_status = \'paid\', status = \'paid\', updated_at = NOW() WHERE id = $1', [orderId]);
}

module.exports = {
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
};
