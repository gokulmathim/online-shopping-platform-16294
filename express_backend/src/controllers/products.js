'use strict';
const productService = require('../services/productService');

class ProductController {
  /**
   * PUBLIC_INTERFACE
   * List or search products.
   */
  async list(req, res) {
    try {
      const { q, category, minPrice, maxPrice, limit, offset } = req.query;
      const result = await productService.search({
        q,
        category,
        minPrice: minPrice != null ? Number(minPrice) : undefined,
        maxPrice: maxPrice != null ? Number(maxPrice) : undefined,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to list products' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Get product by id.
   */
  async get(req, res) {
    try {
      const product = await productService.get(Number(req.params.id));
      if (!product) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json(product);
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to get product' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Create product (admin).
   */
  async create(req, res) {
    try {
      const { name, description, price, imageUrl, category, stock } = req.body || {};
      if (!name || price == null) return res.status(400).json({ message: 'name and price are required' });
      const product = await productService.create({
        name,
        description,
        price: Number(price),
        imageUrl,
        category,
        stock: stock != null ? Number(stock) : undefined,
      });
      return res.status(201).json(product);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to create product' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Update product (admin).
   */
  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const payload = req.body || {};
      if (payload.price != null) payload.price = Number(payload.price);
      if (payload.stock != null) payload.stock = Number(payload.stock);
      const product = await productService.update(id, payload);
      if (!product) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json(product);
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to update product' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Delete product (admin).
   */
  async remove(req, res) {
    try {
      await productService.remove(Number(req.params.id));
      return res.status(204).send();
    } catch (_err) {
      return res.status(500).json({ message: 'Failed to delete product' });
    }
  }
}

module.exports = new ProductController();
