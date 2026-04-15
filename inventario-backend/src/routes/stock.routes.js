const { Router } = require('express');
const { registrarMovimiento } = require('../controllers/stock.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Stock:
 *       type: object
 *       properties:
 *         id_producto:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Teclado mecánico
 *         stock_actual:
 *           type: integer
 *           example: 20
 *         stock_minimo:
 *           type: integer
 *           example: 5
 */

const router = Router();

/**
 * @swagger
    * /api/stock/movimiento:
    *  post:
    *   summary: Registrar un movimiento de stock (entrada o salida)
    *  tags: [Stock]
    * security:
    *   - bearerAuth: []
    * requestBody:
    *  required: true
    * content:
    *   application/json:
    *     schema:
    *       $ref: '#/components/schemas/MovimientoStock'
    * responses:
    *  200:
    *   description: Movimiento registrado exitosamente
 */
router.post('/movimiento', authenticate, registrarMovimiento);

module.exports = router;