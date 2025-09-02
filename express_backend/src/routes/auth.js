'use strict';
const express = require('express');
const controller = require('../controllers/auth');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and profile
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *     responses:
 *       201: { description: Registered }
 *       409: { description: Conflict }
 */
router.post('/register', controller.register.bind(controller));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.post('/login', controller.login.bind(controller));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     security: [{ bearerAuth: [] }]
 *     tags: [Auth]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.get('/me', requireAuth, controller.me.bind(controller));

module.exports = router;
