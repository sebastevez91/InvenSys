require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// 1. DEFINICIÓN BASE de tu API
//    Esto es el "encabezado" de tu documentación.
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',          // versión del estándar OpenAPI
    info: {
      title: 'InvenSys API',
      version: '1.0.0',
      description: 'API REST para sistema de gestión de inventario',
    },
    servers: [
      {
        url: 'http://localhost:3000', // cambiá el puerto si usás otro
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {            // le decimos a Swagger que usás JWT
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }], // aplica JWT a todos los endpoints por defecto
  },

  // 2. DÓNDE BUSCAR los comentarios de documentación
  //    Apuntamos a todos los archivos de rutas
  apis: ['./src/routes/*.js'],
};

// 3. GENERAR la especificación
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. MONTAR la interfaz visual en /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
