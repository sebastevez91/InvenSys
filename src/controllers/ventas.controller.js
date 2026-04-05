const ventasService = require('../services/ventas.service');

const crear = async (req, res, next) => {
  try {
    const { metodo_pago, productos } = req.body;

    if (!metodo_pago) {
      return res.status(400).json({ message: 'metodo_pago es requerido' });
    }
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'productos debe ser un array con al menos un item' });
    }

    const metodosValidos = ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'otro'];
    if (!metodosValidos.includes(metodo_pago)) {
      return res.status(400).json({ message: `metodo_pago debe ser uno de: ${metodosValidos.join(', ')}` });
    }

    for (const p of productos) {
      if (!p.id_producto || !p.id_almacen || !p.cantidad) {
        return res.status(400).json({ message: 'Cada producto debe tener id_producto, id_almacen y cantidad' });
      }
    }

    const resultado = await ventasService.crear({
      ...req.body,
      id_usuario: req.user.id_usuario,
    });

    res.status(201).json({ success: true, message: 'Venta registrada', ...resultado });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const datos = await ventasService.getAll();
    res.json({ success: true, datos });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const venta = await ventasService.getById(parseInt(req.params.id));
    if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json({ success: true, dato: venta });
  } catch (error) {
    next(error);
  }
};

module.exports = { crear, getAll, getById };