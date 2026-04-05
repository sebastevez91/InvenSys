const { getPool, sql } = require('../config/database');

const crear = async ({ id_proveedor, observaciones, productos, id_usuario }) => {
  const pool = getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const reqCompra = new sql.Request(transaction);
    const resultCompra = await reqCompra
      .input('id_proveedor',  sql.Int,     id_proveedor)
      .input('id_usuario',    sql.Int,     id_usuario)
      .input('observaciones', sql.VarChar, observaciones || null)
      .query(`
        INSERT INTO COMPRAS (id_proveedor, id_usuario, observaciones)
        OUTPUT INSERTED.id_compra
        VALUES (@id_proveedor, @id_usuario, @observaciones)
      `);

    const id_compra = resultCompra.recordset[0].id_compra;

    let total = 0;

    for (const producto of productos) {
      const { id_producto, id_almacen, cantidad, precio_unitario } = producto;

      // Insertar el detalle de la compra
      const reqDetalle = new sql.Request(transaction);
      await reqDetalle
        .input('id_compra',       sql.Int,     id_compra)
        .input('id_producto',     sql.Int,     id_producto)
        .input('cantidad',        sql.Int,     cantidad)
        .input('precio_unitario', sql.Decimal, precio_unitario)
        .query(`
          INSERT INTO DETALLE_COMPRA (id_compra, id_producto, cantidad, precio_unitario)
          VALUES (@id_compra, @id_producto, @cantidad, @precio_unitario)
        `);

      // Actualizar el stock
      const reqStock = new sql.Request(transaction);
      await reqStock
        .input('cantidad',    sql.Int, cantidad)
        .input('id_producto', sql.Int, id_producto)
        .input('id_almacen',  sql.Int, id_almacen)
        .query(`
          UPDATE STOCK SET
            cantidad_actual     = cantidad_actual + @cantidad,
            fecha_actualizacion = GETDATE()
          WHERE id_producto = @id_producto
          AND   id_almacen  = @id_almacen
        `);

      // Registrar el movimiento en el historial
      const reqStockActual = new sql.Request(transaction);
      const stockResult = await reqStockActual
        .input('id_producto', sql.Int, id_producto)
        .input('id_almacen',  sql.Int, id_almacen)
        .query(`
          SELECT Cantidad_actual FROM STOCK
          WHERE id_producto = @id_producto
          AND   id_almacen  = @id_almacen
        `);

      const stockPosterior = stockResult.recordset[0].Cantidad_actual;

      const reqMovimiento = new sql.Request(transaction);
      await reqMovimiento
        .input('id_producto',     sql.Int,     id_producto)
        .input('id_almacen',      sql.Int,     id_almacen)
        .input('cantidad',        sql.Int,     cantidad)
        .input('stock_anterior',  sql.Int,     stockPosterior - cantidad)
        .input('stock_posterior', sql.Int,     stockPosterior)
        .input('id_usuario',      sql.Int,     id_usuario)
        .input('id_referencia',   sql.Int,     id_compra)
        .query(`
          INSERT INTO MOVIMIENTOS_STOCK
            (id_producto, id_almacen, tipo, cantidad, stock_anterior, stock_posterior, tipo_referencia, id_usuario, id_referencia)
          VALUES
            (@id_producto, @id_almacen, 'entrada', @cantidad, @stock_anterior, @stock_posterior, 'compra', @id_usuario, @id_referencia)
        `);

      total += cantidad * precio_unitario;
    }

    // Actualizar el total de la compra
    const reqTotal = new sql.Request(transaction);
    await reqTotal
      .input('total',    sql.Decimal, total)
      .input('id_compra', sql.Int,    id_compra)
      .query(`
        UPDATE COMPRAS SET
          total  = @total,
          estado = 'recibida'
        WHERE id_compra = @id_compra
      `);

    await transaction.commit();

    return { id_compra, total };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAll = async () => {
  const pool = getPool();
  const result = await pool.request().query(`
    SELECT
      c.id_compra,
      c.fecha_compra,
      c.estado,
      c.total,
      c.observaciones,
      p.nombre_empresa AS proveedor,
      u.nombre_usuario AS usuario
    FROM COMPRAS c
    INNER JOIN PROVEEDORES p ON c.id_proveedor = p.id_proveedor
    INNER JOIN USUARIOS    u ON c.id_usuario   = u.id_usuario
    ORDER BY c.fecha_compra DESC
  `);
  return result.recordset;
};

const getById = async (id) => {
  const pool = getPool();

  const compra = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        c.*,
        p.nombre_empresa AS proveedor,
        u.nombre_usuario AS usuario
      FROM COMPRAS c
      INNER JOIN PROVEEDORES p ON c.id_proveedor = p.id_proveedor
      INNER JOIN USUARIOS    u ON c.id_usuario   = u.id_usuario
      WHERE c.id_compra = @id
    `);

  if (!compra.recordset[0]) return null;

  const detalles = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        dc.id_detalle_compra,
        dc.cantidad,
        dc.precio_unitario,
        dc.subtotal,
        p.nombre AS producto,
        p.sku
      FROM DETALLE_COMPRA dc
      INNER JOIN PRODUCTOS p ON dc.id_producto = p.id_producto
      WHERE dc.id_compra = @id
    `);

  return {
    ...compra.recordset[0],
    detalles: detalles.recordset,
  };
};

module.exports = { crear, getAll, getById };