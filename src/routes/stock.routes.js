const { Router } = require('express');
const { registrarMovimiento } = require('../controllers/stock.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/movimiento', authenticate, registrarMovimiento);

module.exports = router;