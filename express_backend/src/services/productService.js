'use strict';
const {
  ensureProductTable,
  listProducts,
  countProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../models/productModel');

/**
 * PUBLIC_INTERFACE
 * Initialize product tables.
 */
async function init() {
  await ensureProductTable();
}

/**
 * PUBLIC_INTERFACE
 * Search and list products with pagination.
 */
async function search(params) {
  const [items, total] = await Promise.all([
    listProducts(params),
    countProducts(params),
  ]);
  return { items, total };
}

/**
 * PUBLIC_INTERFACE
 * Get product details.
 */
async function get(id) {
  return getProductById(id);
}

/**
 * PUBLIC_INTERFACE
 * Create product (admin).
 */
async function create(payload) {
  return createProduct(payload);
}

/**
 * PUBLIC_INTERFACE
 * Update product (admin).
 */
async function update(id, payload) {
  return updateProduct(id, payload);
}

/**
 * PUBLIC_INTERFACE
 * Remove product (admin).
 */
async function remove(id) {
  return deleteProduct(id);
}

module.exports = {
  init,
  search,
  get,
  create,
  update,
  remove,
};
