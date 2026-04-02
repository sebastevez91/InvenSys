require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Rutas de la API
app.use('/api', routes);

// Manejo de rutas no encontradas y errores
app.use(notFound);
app.use(errorHandler);

// Arrancar servidor
const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Entorno: ${process.env.NODE_ENV}`);
  });
};

start();
