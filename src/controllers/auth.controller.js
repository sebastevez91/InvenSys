const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { nombre_usuario, contrasena } = req.body;
    if (!nombre_usuario || !contrasena) {
      return res.status(400).json({ message: 'nombre_usuario y contrasena son requeridos' });
    }
    const data = await authService.login(nombre_usuario, contrasena);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
