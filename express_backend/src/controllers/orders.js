'use strict';
const orderService = require('../services/orderService');

class OrdersController {
  /**
   * PUBLIC_INTERFACE
   * Checkout and create order with payment
   */
  async checkout(req, res) {
    try {
      const { provider, currency } = req.body || {};
      const result = await orderService.checkout(req.user.id, { provider, currency });
      return res.status(201).json(result);
    } catch (err) {
      const status = err.message === 'Cart is empty' ? 400 : 500;
      return res.status(status).json({ message: err.message || 'Checkout failed' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Get order details
   */
  async get(req, res) {
    try {
      const order = await orderService.getOrder(req.user.id, Number(req.params.id));
      if (!order) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json(order);
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to get order' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * List user orders
   */
  async list(req, res) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const orders = await orderService.getOrders(req.user.id, limit, offset);
      return res.status(200).json({ items: orders });
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to list orders' });
    }
  }
}

module.exports = new OrdersController();
