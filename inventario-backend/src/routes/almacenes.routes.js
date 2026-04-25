const express = require('express');
const router = express.Router();
const { getAll } = require('../controllers/almacenes.controller');

router.get('/', getAll);

module.exports = router;