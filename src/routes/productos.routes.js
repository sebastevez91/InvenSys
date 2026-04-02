const { Router } = require('express');
const { getAll, getById, create, update, remove } = require('../controllers/productos.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/',       authenticate, getAll);
router.get('/:id',    authenticate, getById);
router.post('/',      authenticate, authorizeAdmin, create);
router.put('/:id',    authenticate, authorizeAdmin, update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;
