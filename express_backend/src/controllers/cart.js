'use strict';
const orderService = require('../services/orderService');

class CartController {
  /**
   * PUBLIC_INTERFACE
   * Get current user's active cart
   */
  async getCart(req, res) {
    try {
      const data = await orderService.getActiveCart(req.user.id);
      return res.status(200).json(data);
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to load cart' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Add product to cart
   */
  async add(req, res) {
    try {
      const { productId, quantity } = req.body || {};
      if (!productId || !quantity) return res.status(400).json({ message: 'productId and quantity required' });
      const data = await orderService.addToCart(req.user.id, Number(productId), Number(quantity));
      return res.status(200).json(data);
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to add to cart' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Update product quantity in cart
   */
  async update(req, res) {
    try {
      const { productId, quantity } = req.body || {};
      if (!productId || quantity == null) return res.status(400).json({ message: 'productId and quantity required' });
      const data = await orderService.updateCartItem(req.user.id, Number(productId), Number(quantity));
      return res.status(200).json(data);
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to update cart' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Remove a product from cart
   */
  async remove(req, res) {
    try {
      const productId = Number(req.params.productId);
      const data = await orderService.removeFromCart(req.user.id, productId);
      return res.status(200).json(data);
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to remove from cart' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Clear cart
   */
  async clear(req, res) {
    try {
      const data = await orderService.clearUserCart(req.user.id);
      return res.status(200).json(data);
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to clear cart' });
    }
  }
}

module.exports = new CartController();
