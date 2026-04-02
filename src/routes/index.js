const { Router } = require('express');
const authRoutes       = require('./auth.routes');
const productosRoutes  = require('./productos.routes');
const categoriasRoutes = require('./categorias.routes');

const router = Router();

router.use('/auth',       authRoutes);
router.use('/productos',  productosRoutes);
router.use('/categorias', categoriasRoutes);

// Aquí irán las demás rutas a medida que avances:
// router.use('/proveedores', proveedoresRoutes);
// router.use('/stock',       stockRoutes);
// router.use('/compras',     comprasRoutes);
// router.use('/ventas',      ventasRoutes);

module.exports = router;
