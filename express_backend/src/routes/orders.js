'use strict';
const express = require('express');
const controller = require('../controllers/orders');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Checkout and order tracking
 */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Checkout current cart (creates order and processes payment)
 *     security: [{ bearerAuth: [] }]
 *     tags: [Orders]
 *     responses:
 *       201: { description: Created }
 */
router.post('/checkout', requireAuth, controller.checkout.bind(controller));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List my orders
 *     security: [{ bearerAuth: [] }]
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', requireAuth, controller.list.bind(controller));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     security: [{ bearerAuth: [] }]
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not Found }
 */
router.get('/:id', requireAuth, controller.get.bind(controller));

module.exports = router;
