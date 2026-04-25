const { getPool, sql } = require('../config/database');

const getAll = async () => {
  const pool = getPool();
  const result = await pool.request().query(`
    SELECT id_almacen, nombre_almacen, ubicacion
    FROM ALMACENES
    WHERE estado = 1
    ORDER BY id_almacen
  `);
  return result.recordset;
};

module.exports = { getAll };