const productosService = require('../services/productos.service');

const getAll = async (req, res, next) => {
  try {
    const { pagina, limite, busqueda, id_categoria } = req.query;
    const data = await productosService.getAll({
      pagina: parseInt(pagina) || 1,
      limite: parseInt(limite) || 10,
      busqueda: busqueda || '',
      id_categoria: id_categoria ? parseInt(id_categoria) : null,
    });
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const producto = await productosService.getById(parseInt(req.params.id));
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ success: true, dato: producto });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const id = await productosService.create(req.body);
    res.status(201).json({ success: true, message: 'Producto creado', id_producto: id });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    await productosService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, message: 'Producto actualizado' });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await productosService.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Producto desactivado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
