'use strict';
const express = require('express');
const controller = require('../controllers/products');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog and search
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List/search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product list returned
 */
router.get('/', controller.list.bind(controller));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product details
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/:id', controller.get.bind(controller));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create product (admin)
 *     security: [{ bearerAuth: [] }]
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *     responses:
 *       201: { description: Created }
 */
router.post('/', requireAuth, requireRole('admin'), controller.create.bind(controller));

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product (admin)
 *     security: [{ bearerAuth: [] }]
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.put('/:id', requireAuth, requireRole('admin'), controller.update.bind(controller));

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product (admin)
 *     security: [{ bearerAuth: [] }]
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: No Content }
 */
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove.bind(controller));

module.exports = router;
