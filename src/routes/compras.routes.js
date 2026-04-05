const { Router } = require('express');
const { crear, getAll, getById } = require('../controllers/compras.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/',    authenticate, getAll);
router.get('/:id', authenticate, getById);
router.post('/',   authenticate, authorizeAdmin, crear);

module.exports = router;