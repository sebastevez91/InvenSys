const { Router } = require('express');
const authRoutes       = require('./auth.routes');
const productosRoutes  = require('./productos.routes');
const categoriasRoutes = require('./categorias.routes');
const stockRoutes      = require('./stock.routes');
const proveedoresRoutes = require('./proveedores.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/stock', stockRoutes);
router.use('/proveedores', proveedoresRoutes);

// Aquí irán las demás rutas a medida que avances:
// router.use('/compras',     comprasRoutes);
// router.use('/ventas',      ventasRoutes);

module.exports = router;
