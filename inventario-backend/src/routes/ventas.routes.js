const { Router } = require('express');
const { crear, getAll, getById } = require('../controllers/ventas.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Venta:
 *       type: object
 *       properties:
 *         id_venta:
 *           type: integer
 *           example: 1
 *         fecha:
 *           type: string
 *           format: date
 *           example: 2024-01-20
 *         total:
 *           type: number
 *           example: 90000
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
 *                 example: 2
 *               precio_unitario:
 *                 type: number
 *                 example: 45000
 */

const router = Router();

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 */
router.get('/',    authenticate, getAll);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener una venta por ID
 *     tags: [Ventas]
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
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       404:
 *         description: Venta no encontrada
 */
router.get('/:id', authenticate, getById);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Registrar una nueva venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Venta'
 *     responses:
 *       201:
 *         description: Venta registrada
 *       400:
 *         description: Datos inválidos
 */
router.post('/',   authenticate, authorizeAdmin, crear);

module.exports = router;