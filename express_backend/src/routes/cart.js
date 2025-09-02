'use strict';
const express = require('express');
const controller = require('../controllers/cart');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get active cart
 *     security: [{ bearerAuth: [] }]
 *     tags: [Cart]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', requireAuth, controller.getCart.bind(controller));

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     security: [{ bearerAuth: [] }]
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *     responses:
 *       200: { description: OK }
 */
router.post('/', requireAuth, controller.add.bind(controller));

/**
 * @swagger
 * /cart:
 *   put:
 *     summary: Update item quantity
 *     security: [{ bearerAuth: [] }]
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *     responses:
 *       200: { description: OK }
 */
router.put('/', requireAuth, controller.update.bind(controller));

/**
 * @swagger
 * /cart/item/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     security: [{ bearerAuth: [] }]
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
router.delete('/item/:productId', requireAuth, controller.remove.bind(controller));

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear cart
 *     security: [{ bearerAuth: [] }]
 *     tags: [Cart]
 *     responses:
 *       200: { description: OK }
 */
router.delete('/clear', requireAuth, controller.clear.bind(controller));

module.exports = router;
