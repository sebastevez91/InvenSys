const proveedoresService = require('../services/proveedores.service');

const getAll = async (req, res, next) => {
  try {
    const datos = await proveedoresService.getAll();
    res.json({ success: true, datos });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const proveedor = await proveedoresService.getById(parseInt(req.params.id));
    if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json({ success: true, dato: proveedor });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { nombre_empresa } = req.body;
    if (!nombre_empresa) {
      return res.status(400).json({ message: 'nombre_empresa es requerido' });
    }
    const id = await proveedoresService.create(req.body);
    res.status(201).json({ success: true, message: 'Proveedor creado', id_proveedor: id });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { nombre_empresa } = req.body;
    if (!nombre_empresa) {
      return res.status(400).json({ message: 'nombre_empresa es requerido' });
    }
    await proveedoresService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, message: 'Proveedor actualizado' });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await proveedoresService.remove(parseInt(req.params.id));
    res.json({ success: true, message: 'Proveedor desactivado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };