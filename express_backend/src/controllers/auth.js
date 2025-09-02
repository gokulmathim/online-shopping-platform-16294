'use strict';
const userService = require('../services/userService');

class AuthController {
  /**
   * PUBLIC_INTERFACE
   * Register a new user
   */
  async register(req, res) {
    try {
      const { email, password, name } = req.body || {};
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'email, password, and name are required' });
      }
      const result = await userService.register({ email, password, name });
      return res.status(201).json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ message: err.message || 'Registration failed' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }
      const result = await userService.login({ email, password });
      return res.status(200).json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ message: err.message || 'Login failed' });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Get current user profile
   */
  async me(req, res) {
    try {
      const user = await userService.profile(req.user.id);
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to load profile' });
    }
  }
}

module.exports = new AuthController();
