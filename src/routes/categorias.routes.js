const { Router } = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/categorias.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Todos los usuarios autenticados pueden ver categorías
router.get('/',       authenticate, getAll);
router.get('/:id',    authenticate, getById);

// Solo admins pueden crear, editar o eliminar
router.post('/',      authenticate, authorizeAdmin, create);
router.put('/:id',    authenticate, authorizeAdmin, update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;
