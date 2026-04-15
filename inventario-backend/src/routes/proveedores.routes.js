const { Router } = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/proveedores.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Proveedor:
 *       type: object
 *       properties:
 *         id_proveedor:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: TechSupply SA
 *         contacto:
 *           type: string
 *           example: Juan Pérez
 *         email:
 *           type: string
 *           example: contacto@techsupply.com
 *         telefono:
 *           type: string
 *           example: +54 11 1234-5678
 */

const router = Router();

/**
 * @swagger
 * /api/proveedores:
 *   get:
 *     summary: Obtener todos los proveedores
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proveedor'
 */
router.get('/',       authenticate, getAll);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   get:
 *     summary: Obtener un proveedor por ID
 *     tags: [Proveedores]
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
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: Proveedor no encontrado
 */
router.get('/:id',    authenticate, getById);

/**
 * @swagger
 * /api/proveedores:
 *   post:
 *     summary: Crear un nuevo proveedor
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Proveedor'
 *     responses:
 *       201:
 *         description: Proveedor creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/',      authenticate, authorizeAdmin, create);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   put:
 *     summary: Actualizar un proveedor
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Proveedor'
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 *       404:
 *         description: Proveedor no encontrado
 */
router.put('/:id',    authenticate, authorizeAdmin, update);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   delete:
 *     summary: Eliminar un proveedor
 *     tags: [Proveedores]
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
 *         description: Proveedor eliminado
 *       404:
 *         description: Proveedor no encontrado
 */
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;