const almacenesService = require('../services/almacenes.service');

const getAll = async (req, res) => {
  try {
    const data = await almacenesService.getAll();
    res.json({ datos: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAll };