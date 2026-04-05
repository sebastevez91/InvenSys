// Manejo global de errores — captura cualquier error no controlado
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Rutas no encontradas
const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.url}` });
};

module.exports = { errorHandler, notFound };
