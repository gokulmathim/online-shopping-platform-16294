'use strict';
const { ensureUserTable, createUser, findUserByEmail, findUserById } = require('../models/userModel');
const { hashPassword, verifyPassword, generateToken } = require('../utils/crypto');

/**
 * PUBLIC_INTERFACE
 * Initialize user data structures.
 */
async function init() {
  await ensureUserTable();
}

/**
 * PUBLIC_INTERFACE
 * Register a new user.
 */
async function register({ email, password, name }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }
  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, name });
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
}

/**
 * PUBLIC_INTERFACE
 * Authenticate user.
 */
async function login({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

/**
 * PUBLIC_INTERFACE
 * Get current user profile.
 */
async function profile(userId) {
  const user = await findUserById(userId);
  return user;
}

module.exports = {
  init,
  register,
  login,
  profile,
};
