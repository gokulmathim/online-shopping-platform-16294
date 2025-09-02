'use strict';
const { query } = require('../config/db');

/**
 * PUBLIC_INTERFACE
 * Ensure products table exists.
 */
async function ensureProductTable() {
  await query('\
    CREATE TABLE IF NOT EXISTS products (\
      id SERIAL PRIMARY KEY,\
      name VARCHAR(255) NOT NULL,\
      description TEXT,\
      price NUMERIC(12,2) NOT NULL,\
      image_url TEXT,\
      category VARCHAR(100),\
      stock INTEGER NOT NULL DEFAULT 0,\
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),\
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()\
    );\
    CREATE INDEX IF NOT EXISTS idx_products_name ON products USING GIN (to_tsvector(\'english\', name));\
    CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);\
  ');
}

/**
 * PUBLIC_INTERFACE
 * List products with optional search/filter and pagination.
 */
async function listProducts({ q, category, minPrice, maxPrice, limit = 20, offset = 0 }) {
  const conditions = [];
  const params = [];
  let p = 1;

  if (q) {
    conditions.push(`to_tsvector('english', name || ' ' || coalesce(description,'')) @@ plainto_tsquery('english', $${p++})`);
    params.push(q);
  }
  if (category) {
    conditions.push(`category = $${p++}`);
    params.push(category);
  }
  if (minPrice != null) {
    conditions.push(`price >= $${p++}`);
    params.push(minPrice);
  }
  if (maxPrice != null) {
    conditions.push(`price <= $${p++}`);
    params.push(maxPrice);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await query(
    `SELECT id, name, description, price, image_url, category, stock, created_at, updated_at
     FROM products
     ${where}
     ORDER BY created_at DESC
     LIMIT $${p++} OFFSET $${p++}`,
    params
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Count products (for pagination).
 */
async function countProducts({ q, category, minPrice, maxPrice }) {
  const conditions = [];
  const params = [];
  let p = 1;

  if (q) {
    conditions.push(`to_tsvector('english', name || ' ' || coalesce(description,'')) @@ plainto_tsquery('english', $${p++})`);
    params.push(q);
  }
  if (category) {
    conditions.push(`category = $${p++}`);
    params.push(category);
  }
  if (minPrice != null) {
    conditions.push(`price >= $${p++}`);
    params.push(minPrice);
  }
  if (maxPrice != null) {
    conditions.push(`price <= $${p++}`);
    params.push(maxPrice);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(`SELECT COUNT(*)::int AS count FROM products ${where}`, params);
  return rows[0]?.count || 0;
}

/**
 * PUBLIC_INTERFACE
 * Get product by id.
 */
async function getProductById(id) {
  const { rows } = await query(
    'SELECT id, name, description, price, image_url, category, stock, created_at, updated_at\
     FROM products WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

/**
 * PUBLIC_INTERFACE
 * Create a product.
 */
async function createProduct({ name, description, price, imageUrl, category, stock }) {
  const { rows } = await query(
    'INSERT INTO products (name, description, price, image_url, category, stock)\
     VALUES ($1,$2,$3,$4,$5,$6)\
     RETURNING id, name, description, price, image_url, category, stock, created_at, updated_at',
    [name, description, price, imageUrl, category, stock ?? 0]
  );
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Update a product.
 */
async function updateProduct(id, { name, description, price, imageUrl, category, stock }) {
  const { rows } = await query(
    'UPDATE products\
     SET name = COALESCE($2, name),\
         description = COALESCE($3, description),\
         price = COALESCE($4, price),\
         image_url = COALESCE($5, image_url),\
         category = COALESCE($6, category),\
         stock = COALESCE($7, stock),\
         updated_at = NOW()\
     WHERE id = $1\
     RETURNING id, name, description, price, image_url, category, stock, created_at, updated_at',
    [id, name, description, price, imageUrl, category, stock]
  );
  return rows[0] || null;
}

/**
 * PUBLIC_INTERFACE
 * Delete product by id.
 */
async function deleteProduct(id) {
  await query('DELETE FROM products WHERE id = $1', [id]);
  return true;
}

module.exports = {
  ensureProductTable,
  listProducts,
  countProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
