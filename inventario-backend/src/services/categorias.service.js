const { getPool, sql } = require('../config/database');

const getAll = async () => {
  const pool = getPool();
  const result = await pool.request().query(`
    SELECT
      c.id_categoria,
      c.nombre_categoria,
      c.descripcion,
      c.id_categoria_padre,
      padre.nombre_categoria AS categoria_padre,
      COUNT(p.id_producto) AS total_productos
    FROM CATEGORIAS c
    LEFT JOIN CATEGORIAS padre ON c.id_categoria_padre = padre.id_categoria
    LEFT JOIN PRODUCTOS p ON p.id_categoria = c.id_categoria AND p.estado = 1
    GROUP BY
      c.id_categoria, c.nombre_categoria, c.descripcion,
      c.id_categoria_padre, padre.nombre_categoria
    ORDER BY c.id_categoria
  `);
  return result.recordset;
};

const getById = async (id) => {
  const pool = getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        c.id_categoria,
        c.nombre_categoria,
        c.descripcion,
        c.id_categoria_padre,
        padre.nombre_categoria AS categoria_padre
      FROM CATEGORIAS c
      LEFT JOIN CATEGORIAS padre ON c.id_categoria_padre = padre.id_categoria
      WHERE c.id_categoria = @id
    `);
  return result.recordset[0] || null;
};

const create = async ({ nombre_categoria, descripcion, id_categoria_padre }) => {
  const pool = getPool();
  const result = await pool.request()
    .input('nombre_categoria',  sql.VarChar, nombre_categoria)
    .input('descripcion',       sql.VarChar, descripcion || null)
    .input('id_categoria_padre',sql.Int,     id_categoria_padre || null)
    .query(`
      INSERT INTO CATEGORIAS (nombre_categoria, descripcion, id_categoria_padre)
      OUTPUT INSERTED.id_categoria
      VALUES (@nombre_categoria, @descripcion, @id_categoria_padre)
    `);
  return result.recordset[0].id_categoria;
};

const update = async (id, { nombre_categoria, descripcion, id_categoria_padre }) => {
  const pool = getPool();

  // Evitar que una categoría sea su propio padre
  if (id_categoria_padre && id_categoria_padre === id) {
    throw { status: 400, message: 'Una categoría no puede ser su propio padre' };
  }

  await pool.request()
    .input('id',                sql.Int,     id)
    .input('nombre_categoria',  sql.VarChar, nombre_categoria)
    .input('descripcion',       sql.VarChar, descripcion || null)
    .input('id_categoria_padre',sql.Int,     id_categoria_padre || null)
    .query(`
      UPDATE CATEGORIAS SET
        nombre_categoria   = @nombre_categoria,
        descripcion        = @descripcion,
        id_categoria_padre = @id_categoria_padre
      WHERE id_categoria = @id
    `);
};

const remove = async (id) => {
  const pool = getPool();

  // Verificar que no tenga productos activos asociados
  const check = await pool.request()
    .input('id', sql.Int, id)
    .query(`SELECT COUNT(*) AS total FROM PRODUCTOS WHERE id_categoria = @id AND estado = 1`);

  if (check.recordset[0].total > 0) {
    throw { status: 409, message: 'No se puede eliminar: la categoría tiene productos activos asociados' };
  }

  await pool.request()
    .input('id', sql.Int, id)
    .query(`DELETE FROM CATEGORIAS WHERE id_categoria = @id`);
};

module.exports = { getAll, getById, create, update, remove };
