const { getPool, sql } = require('../config/database');

const getAll = async ({ pagina = 1, limite = 10, busqueda = '', id_categoria = null }) => {
  const pool = getPool();
  const offset = (pagina - 1) * limite;

  const request = pool.request()
    .input('busqueda', sql.VarChar, `%${busqueda}%`)
    .input('limite', sql.Int, limite)
    .input('offset', sql.Int, offset);

  let whereCategoria = '';
  if (id_categoria) {
    request.input('id_categoria', sql.Int, id_categoria);
    whereCategoria = 'AND p.id_categoria = @id_categoria';
  }

  const result = await request.query(`
    SELECT
      p.id_producto, p.sku, p.nombre, p.descripcion,
      p.precio_venta, p.precio_costo, p.punto_reorden, p.estado,
      c.nombre_categoria,
      ISNULL(s.cantidad_actual, 0) AS stock_total,
      CASE WHEN ISNULL(s.cantidad_actual, 0) <= p.punto_reorden THEN 1 ELSE 0 END AS stock_bajo
    FROM PRODUCTOS p
    INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
    LEFT JOIN (
      SELECT id_producto, SUM(cantidad_actual) AS cantidad_actual
      FROM STOCK GROUP BY id_producto
    ) s ON p.id_producto = s.id_producto
    WHERE (p.nombre LIKE @busqueda OR p.sku LIKE @busqueda)
    ${whereCategoria}
    ORDER BY p.id_producto
    OFFSET @offset ROWS FETCH NEXT @limite ROWS ONLY
  `);

  const totalResult = await pool.request()
    .input('busqueda', sql.VarChar, `%${busqueda}%`)
    .query(`SELECT COUNT(*) AS total FROM PRODUCTOS p WHERE p.nombre LIKE @busqueda OR p.sku LIKE @busqueda`);

  return {
    datos: result.recordset,
    paginacion: {
      pagina,
      limite,
      total: totalResult.recordset[0].total,
      paginas: Math.ceil(totalResult.recordset[0].total / limite),
    },
  };
};

const getById = async (id) => {
  const pool = getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT p.*, c.nombre_categoria
      FROM PRODUCTOS p
      INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = @id
    `);
  return result.recordset[0] || null;
};

const create = async (data) => {
  const pool = getPool();
  const { sku, nombre, descripcion, id_categoria, precio_venta, precio_costo, punto_reorden } = data;
  const result = await pool.request()
    .input('sku', sql.VarChar, sku)
    .input('nombre', sql.VarChar, nombre)
    .input('descripcion', sql.VarChar, descripcion)
    .input('id_categoria', sql.Int, id_categoria)
    .input('precio_venta', sql.Decimal, precio_venta)
    .input('precio_costo', sql.Decimal, precio_costo)
    .input('punto_reorden', sql.Int, punto_reorden || 0)
    .query(`
      INSERT INTO PRODUCTOS (sku, nombre, descripcion, id_categoria, precio_venta, precio_costo, punto_reorden)
      OUTPUT INSERTED.id_producto
      VALUES (@sku, @nombre, @descripcion, @id_categoria, @precio_venta, @precio_costo, @punto_reorden)
    `);
  return result.recordset[0].id_producto;
};

const update = async (id, data) => {
  const pool = getPool();
  const { nombre, descripcion, id_categoria, precio_venta, precio_costo, punto_reorden, estado } = data;
  await pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.VarChar, nombre)
    .input('descripcion', sql.VarChar, descripcion)
    .input('id_categoria', sql.Int, id_categoria)
    .input('precio_venta', sql.Decimal, precio_venta)
    .input('precio_costo', sql.Decimal, precio_costo)
    .input('punto_reorden', sql.Int, punto_reorden)
    .input('estado', sql.Bit, estado)
    .query(`
      UPDATE PRODUCTOS SET
        nombre = @nombre, descripcion = @descripcion,
        id_categoria = @id_categoria, precio_venta = @precio_venta,
        precio_costo = @precio_costo, punto_reorden = @punto_reorden,
        estado = @estado, fecha_actualizacion = GETDATE()
      WHERE id_producto = @id
    `);
};

const remove = async (id) => {
  const pool = getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE PRODUCTOS SET estado = 0, fecha_actualizacion = GETDATE() WHERE id_producto = @id`);
};

module.exports = { getAll, getById, create, update, remove };
