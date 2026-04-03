const stockService = require('../services/stock.service');

const registrarMovimiento = async (req, res, next) => {
  try {
    const { id_producto, id_almacen, tipo, cantidad, observacion } = req.body;

    if (!id_producto || !id_almacen || !tipo || !cantidad) {
      return res.status(400).json({ message: 'id_producto, id_almacen, tipo y cantidad son requeridos' });
    }

    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return res.status(400).json({ message: 'tipo debe ser entrada, salida o ajuste' });
    }

    if (cantidad <= 0) {
      return res.status(400).json({ message: 'cantidad debe ser mayor a 0' });
    }

    const resultado = await stockService.registrarMovimiento({
      id_producto,
      id_almacen,
      tipo,
      cantidad,
      id_usuario: req.user.id_usuario, // Asumo que el middleware de autenticación agrega el usuario al request
      observacion,
    });

    res.json({ success: true, ...resultado });
  } catch (error) {
    next(error);
  }
};

module.exports = { registrarMovimiento };