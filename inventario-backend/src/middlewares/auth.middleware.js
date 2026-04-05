const { verifyToken } = require('../config/jwt');

// Verifica que el request tenga un JWT válido
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id_usuario, nombre_usuario, rol }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// Verifica que el usuario tenga rol de admin
const authorizeAdmin = (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol admin' });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };
