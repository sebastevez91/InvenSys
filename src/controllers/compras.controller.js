const comprasService = require('../services/compras.service');

const crear = async (req, res, next) => {
  try {
    const { id_proveedor, productos } = req.body;

    if (!id_proveedor) {
      return res.status(400).json({ message: 'id_proveedor es requerido' });
    }
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'productos debe ser un array con al menos un item' });
    }

    for (const p of productos) {
      if (!p.id_producto || !p.id_almacen || !p.cantidad || !p.precio_unitario) {
        return res.status(400).json({ message: 'Cada producto debe tener id_producto, id_almacen, cantidad y precio_unitario' });
      }
    }

    const resultado = await comprasService.crear({
      ...req.body,
      id_usuario: req.user.id_usuario,
    });

    res.status(201).json({ success: true, message: 'Compra registrada', ...resultado });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const datos = await comprasService.getAll();
    res.json({ success: true, datos });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const compra = await comprasService.getById(parseInt(req.params.id));
    if (!compra) return res.status(404).json({ message: 'Compra no encontrada' });
    res.json({ success: true, dato: compra });
  } catch (error) {
    next(error);
  }
};

module.exports = { crear, getAll, getById };