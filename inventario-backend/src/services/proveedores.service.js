const { getPool, sql } = require('../config/database');

const getAll = async () => {
  const pool = getPool();
  const result = await pool.request().query(`
    SELECT
      p.id_proveedor,
      p.nombre_empresa,
      p.contacto,
      p.telefono,
      p.email,
      p.direccion,
      p.estado,
      COUNT(pp.id_producto) AS total_productos
    FROM PROVEEDORES p
    LEFT JOIN PRODUCTO_PROVEEDOR pp ON p.id_proveedor = pp.id_proveedor
    GROUP BY
      p.id_proveedor, p.nombre_empresa, p.contacto,
      p.telefono, p.email, p.direccion, p.estado
    ORDER BY p.id_proveedor
  `);
  return result.recordset;
};

const getById = async (id) => {
  const pool = getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        p.*,
        COUNT(pp.id_producto) AS total_productos
      FROM PROVEEDORES p
      LEFT JOIN PRODUCTO_PROVEEDOR pp ON p.id_proveedor = pp.id_proveedor
      WHERE p.id_proveedor = @id
      GROUP BY
        p.id_proveedor, p.nombre_empresa, p.contacto,
        p.telefono, p.email, p.direccion, p.estado,
        p.fecha_creacion, p.fecha_actualizacion
    `);
  return result.recordset[0] || null;
};

const create = async ({ nombre_empresa, contacto, telefono, email, direccion }) => {
  const pool = getPool();
  const result = await pool.request()
    .input('nombre_empresa', sql.VarChar, nombre_empresa)
    .input('contacto',       sql.VarChar, contacto || null)
    .input('telefono',       sql.VarChar, telefono || null)
    .input('email',          sql.VarChar, email    || null)
    .input('direccion',      sql.VarChar, direccion|| null)
    .query(`
      INSERT INTO PROVEEDORES (nombre_empresa, contacto, telefono, email, direccion)
      OUTPUT INSERTED.id_proveedor
      VALUES (@nombre_empresa, @contacto, @telefono, @email, @direccion)
    `);
  return result.recordset[0].id_proveedor;
};

const update = async (id, { nombre_empresa, contacto, telefono, email, direccion, estado }) => {
  const pool = getPool();
  await pool.request()
    .input('id',             sql.Int,     id)
    .input('nombre_empresa', sql.VarChar, nombre_empresa)
    .input('contacto',       sql.VarChar, contacto  || null)
    .input('telefono',       sql.VarChar, telefono  || null)
    .input('email',          sql.VarChar, email     || null)
    .input('direccion',      sql.VarChar, direccion || null)
    .input('estado',         sql.Bit,     estado)
    .query(`
      UPDATE PROVEEDORES SET
        nombre_empresa      = @nombre_empresa,
        contacto            = @contacto,
        telefono            = @telefono,
        email               = @email,
        direccion           = @direccion,
        estado              = @estado,
        fecha_actualizacion = GETDATE()
      WHERE id_proveedor = @id
    `);
};

const remove = async (id) => {
  const pool = getPool();

  const check = await pool.request()
    .input('id', sql.Int, id)
    .query(`SELECT COUNT(*) AS total FROM COMPRAS WHERE id_proveedor = @id`);

  if (check.recordset[0].total > 0) {
    throw { status: 409, message: 'No se puede eliminar: el proveedor tiene compras asociadas' };
  }

  await pool.request()
    .input('id', sql.Int, id)
    .query(`UPDATE PROVEEDORES SET estado = 0, fecha_actualizacion = GETDATE() WHERE id_proveedor = @id`);
};

module.exports = { getAll, getById, create, update, remove };