'use strict';
const { query } = require('../config/db');

/**
 * PUBLIC_INTERFACE
 * Create users table if it doesn't exist.
 */
async function ensureUserTable() {
  await query('\
    CREATE TABLE IF NOT EXISTS users (\
      id SERIAL PRIMARY KEY,\
      email VARCHAR(255) UNIQUE NOT NULL,\
      password_hash VARCHAR(255) NOT NULL,\
      name VARCHAR(255) NOT NULL,\
      role VARCHAR(50) NOT NULL DEFAULT \'user\',\
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),\
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()\
    );\
  ');
}

/**
 * PUBLIC_INTERFACE
 * Create a new user.
 */
async function createUser({ email, passwordHash, name, role = 'user' }) {
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, name, role)\
     VALUES ($1,$2,$3,$4)\
     RETURNING id, email, name, role, created_at, updated_at',
    [email, passwordHash, name, role]
  );
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Find user by email.
 */
async function findUserByEmail(email) {
  const { rows } = await query(
    'SELECT id, email, password_hash, name, role, created_at, updated_at FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

/**
 * PUBLIC_INTERFACE
 * Find user by id (public fields).
 */
async function findUserById(id) {
  const { rows } = await query(
    'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  ensureUserTable,
  createUser,
  findUserByEmail,
  findUserById,
};
