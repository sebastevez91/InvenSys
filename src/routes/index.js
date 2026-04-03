const { Router } = require('express');
const authRoutes       = require('./auth.routes');
const productosRoutes  = require('./productos.routes');
const categoriasRoutes = require('./categorias.routes');
const stockRoutes      = require('./stock.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/stock', stockRoutes);

// Aquí irán las demás rutas a medida que avances:
// router.use('/proveedores', proveedoresRoutes);
// router.use('/compras',     comprasRoutes);
// router.use('/ventas',      ventasRoutes);

module.exports = router;
