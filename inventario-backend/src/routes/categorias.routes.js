const { Router } = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/categorias.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       properties:
 *         id_categoria:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Electrónica
 *         descripcion:
 *           type: string
 *           example: Productos electrónicos y tecnología
 */

const router = Router();

// Todos los usuarios autenticados pueden ver categorías
/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */
router.get('/',       authenticate, getAll);

/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categorias]
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
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id',    authenticate, getById);

// Solo admins pueden crear, editar o eliminar
/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         description: Datos inválidos
 */
router.post('/',      authenticate, authorizeAdmin, create);

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categorias]
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
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/:id',    authenticate, authorizeAdmin, update);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Eliminar una categoría
 *     tags: [Categorias]
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
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;
