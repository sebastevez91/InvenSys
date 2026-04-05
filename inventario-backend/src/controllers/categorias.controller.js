const categoriasService = require('../services/categorias.service');

const getAll = async (req, res, next) => {
  try {
    const datos = await categoriasService.getAll();
    res.json({ success: true, datos });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const categoria = await categoriasService.getById(parseInt(req.params.id));
    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json({ success: true, dato: categoria });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { nombre_categoria } = req.body;
    if (!nombre_categoria) {
      return res.status(400).json({ message: 'nombre_categoria es requerido' });
    }
    const id = await categoriasService.create(req.body);
    res.status(201).json({ success: true, message: 'Categoría creada', id_categoria: id });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { nombre_categoria } = req.body;
    if (!nombre_categoria) {
      return res.status(400).json({ message: 'nombre_categoria es requerido' });
    }
    await categoriasService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, message: 'Categoría actualizada' });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await categoriasService.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
