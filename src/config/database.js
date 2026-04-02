const sql = require('mssql/msnodesqlv8');

const dbConfig = {
  connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=${process.env.DB_NAME};Trusted_Connection=yes;`,
  driver: 'msnodesqlv8',
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
    console.error('❌ Error conectando a SQL Server:', error.name, error.message, error.originalError);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) throw new Error('La base de datos no está conectada. Llamá connectDB() primero.');
  return pool;
};

module.exports = { connectDB, getPool, sql };