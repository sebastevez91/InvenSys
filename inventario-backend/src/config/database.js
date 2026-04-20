const sql = require('mssql');

const dbConfig = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,              // requerido por Azure
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

const connectDB = async () => {
  try {
    if (pool) return pool;
    pool = await sql.connect(dbConfig);
    console.log('✅ Conectado a SQL Server:', process.env.DB_NAME);
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a SQL Server:', error.message);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) throw new Error('La base de datos no está conectada. Llamá connectDB() primero.');
  return pool;
};

module.exports = { connectDB, getPool, sql };