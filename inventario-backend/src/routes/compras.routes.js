const { Router } = require('express');
const { crear, getAll, getById } = require('../controllers/compras.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Compra:
 *       type: object
 *       properties:
 *         id_compra:
 *           type: integer
 *           example: 1
 *         id_proveedor:
 *           type: integer
 *           example: 2
 *         fecha:
 *           type: string
 *           format: date
 *           example: 2024-01-15
 *         total:
 *           type: number
 *           example: 150000
 *         detalle:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 3
 *               cantidad:
 *                 type: integer
 *                 example: 10
 *               precio_unitario:
 *                 type: number
 *                 example: 15000
 */

const router = Router();

/**
 * @swagger
 * /api/compras:
 *   get:
 *     summary: Obtener todas las compras
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de compras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Compra'
 */router.get('/',    authenticate, getAll);

 /**
 * @swagger
 * /api/compras/{id}:
 *   get:
 *     summary: Obtener una compra por ID
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compra encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Compra'
 *       404:
 *         description: Compra no encontrada
 */
router.get('/:id', authenticate, getById);

/**
 * @swagger
 * /api/compras:
 *   post:
 *     summary: Registrar una nueva compra
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Compra'
 *     responses:
 *       201:
 *         description: Compra registrada
 *       400:
 *         description: Datos inválidos
 */
router.post('/',   authenticate, authorizeAdmin, crear);

module.exports = router;