const { getPool, sql } = require('../config/database');

const crear = async ({ id_cliente, metodo_pago, observaciones, productos, id_usuario }) => {
  const pool = getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Insertar el encabezado de la venta
    const reqVenta = new sql.Request(transaction);
    const resultVenta = await reqVenta
      .input('id_cliente',    sql.Int,     id_cliente  || null)
      .input('id_usuario',    sql.Int,     id_usuario)
      .input('observaciones', sql.VarChar, observaciones || null)
      .query(`
        INSERT INTO VENTAS (id_cliente, id_usuario, observaciones)
        OUTPUT INSERTED.id_venta
        VALUES (@id_cliente, @id_usuario, @observaciones)
      `);

    const id_venta = resultVenta.recordset[0].id_venta;

    let total = 0;

    for (const producto of productos) {
      const { id_producto, id_almacen, cantidad } = producto;

      // Leer el stock y precio actual
      const reqLeer = new sql.Request(transaction);
      const resultLeer = await reqLeer
        .input('id_producto', sql.Int, id_producto)
        .input('id_almacen',  sql.Int, id_almacen)
        .query(`
          SELECT s.Cantidad_actual, p.precio_venta
          FROM STOCK s
          INNER JOIN PRODUCTOS p ON s.id_producto = p.id_producto
          WHERE s.id_producto = @id_producto
          AND   s.id_almacen  = @id_almacen
        `);

      if (resultLeer.recordset.length === 0) {
        throw { status: 404, message: `No existe stock para el producto ID ${id_producto} en ese almacén` };
      }

      const { Cantidad_actual, precio_venta } = resultLeer.recordset[0];

      // Verificar stock suficiente
      if (Cantidad_actual < cantidad) {
        throw { status: 400, message: `Stock insuficiente para el producto ID ${id_producto}. Stock actual: ${Cantidad_actual}` };
      }

      // Insertar detalle de venta
      const reqDetalle = new sql.Request(transaction);
      await reqDetalle
        .input('id_venta',        sql.Int,     id_venta)
        .input('id_producto',     sql.Int,     id_producto)
        .input('cantidad',        sql.Int,     cantidad)
        .input('precio_unitario', sql.Decimal, precio_venta)
        .query(`
          INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario)
          VALUES (@id_venta, @id_producto, @cantidad, @precio_unitario)
        `);

      // Actualizar stock
      const reqStock = new sql.Request(transaction);
      await reqStock
        .input('cantidad',    sql.Int, cantidad)
        .input('id_producto', sql.Int, id_producto)
        .input('id_almacen',  sql.Int, id_almacen)
        .query(`
          UPDATE STOCK SET
            cantidad_actual     = cantidad_actual - @cantidad,
            fecha_actualizacion = GETDATE()
          WHERE id_producto = @id_producto
          AND   id_almacen  = @id_almacen
        `);

      // Registrar movimiento en historial
      const reqMovimiento = new sql.Request(transaction);
      await reqMovimiento
        .input('id_producto',     sql.Int, id_producto)
        .input('id_almacen',      sql.Int, id_almacen)
        .input('cantidad',        sql.Int, cantidad)
        .input('stock_anterior',  sql.Int, Cantidad_actual)
        .input('stock_posterior', sql.Int, Cantidad_actual - cantidad)
        .input('id_usuario',      sql.Int, id_usuario)
        .input('id_referencia',   sql.Int, id_venta)
        .query(`
          INSERT INTO MOVIMIENTOS_STOCK
            (id_producto, id_almacen, tipo, cantidad, stock_anterior, stock_posterior, tipo_referencia, id_usuario, id_referencia)
          VALUES
            (@id_producto, @id_almacen, 'salida', @cantidad, @stock_anterior, @stock_posterior, 'venta', @id_usuario, @id_referencia)
        `);

      total += cantidad * precio_venta;
    }

    // Actualizar total y estado de la venta
    const reqTotal = new sql.Request(transaction);
    await reqTotal
      .input('total',    sql.Decimal, total)
      .input('id_venta', sql.Int,     id_venta)
      .query(`
        UPDATE VENTAS SET
          total  = @total,
          estado = 'completada'
        WHERE id_venta = @id_venta
      `);

    // Registrar la transacción de pago
    const reqTransaccion = new sql.Request(transaction);
    await reqTransaccion
      .input('id_venta',    sql.Int,     id_venta)
      .input('metodo_pago', sql.VarChar, metodo_pago)
      .input('total',       sql.Decimal, total)
      .query(`
        INSERT INTO TRANSACCIONES (id_venta, metodo_pago, total, estado)
        VALUES (@id_venta, @metodo_pago, @total, 'completada')
      `);

    await transaction.commit();

    return { id_venta, total };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAll = async () => {
  const pool = getPool();
  const result = await pool.request().query(`
    SELECT
      v.id_venta,
      v.fecha_venta,
      v.estado,
      v.total,
      v.observaciones,
      c.nombre        AS cliente,
      u.nombre_usuario AS usuario
    FROM VENTAS v
    LEFT JOIN CLIENTES c ON v.id_cliente = v.id_cliente
    INNER JOIN USUARIOS u ON v.id_usuario = u.id_usuario
    ORDER BY v.fecha_venta DESC
  `);
  return result.recordset;
};

const getById = async (id) => {
  const pool = getPool();

  const venta = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        v.*,
        c.nombre        AS cliente,
        u.nombre_usuario AS usuario
      FROM VENTAS v
      LEFT JOIN CLIENTES c  ON v.id_cliente = c.id_cliente
      INNER JOIN USUARIOS u ON v.id_usuario = u.id_usuario
      WHERE v.id_venta = @id
    `);

  if (!venta.recordset[0]) return null;

  const detalles = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        dv.id_detalle_venta,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal,
        p.nombre AS producto,
        p.sku
      FROM DETALLE_VENTA dv
      INNER JOIN PRODUCTOS p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = @id
    `);

  return {
    ...venta.recordset[0],
    detalles: detalles.recordset,
  };
};

module.exports = { crear, getAll, getById };