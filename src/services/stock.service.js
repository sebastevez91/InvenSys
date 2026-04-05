const { getPool, sql } = require('../config/database');

const registrarMovimiento = async ({ id_producto, id_almacen, tipo, cantidad, id_usuario, observacion }) => {
  
  // Obtengo la conexión de la base de datos
  const pool = getPool();

  // Creó una transacción
  const transaction = new sql.Transaction(pool);

  try {

    // Se abre la transacción
    await transaction.begin();

    // Acá le digo que este request es parte de la transacción.
    const request = new sql.Request(transaction);

    // Leó el stock antes de modificarlo
    const stockActual = await request
      .input('id_producto', sql.Int, id_producto)
      .input('id_almacen', sql.Int, id_almacen)
      .query(
        `SELECT Cantidad_actual
        FROM STOCK
        WHERE id_producto = @id_producto
        AND id_almacen = @id_almacen`
      );

      //console.log('STOCK RESULT:', JSON.stringify(stockActual.recordset));

    // Uso .recordset, que traé un array de objetos
    if(stockActual.recordset.length === 0){
      throw { status: 404, message: 'No existe stock para ese producto en ese almacén'};
    }

    const cantidadAnterior = stockActual.recordset[0].Cantidad_actual;

    /*
    Uso un operador ternario para calcular el stock nuevo.
    Si el tipo es 'entrada' sumamos, sino es asi restamos
    */
    const cantidadNueva = tipo === 'entrada'
      ? cantidadAnterior + cantidad
      : cantidadAnterior - cantidad;

    if(cantidadNueva < 0){
      // Evitamos que tenga stock negativo 
      throw { status: 400, message: `Stock insuficiente. Stock actual: ${cantidadAnterior}`};
    }

    //console.log('DEBUG:', { id_producto, id_almacen, tipo, cantidad, cantidadAnterior, cantidadNueva });

    // Si llegamos hasta acá, es porque el stock nuevo es válido. Entonces actualizamos el stock y registramos el movimiento en el historial.
    const requestUpdate = new sql.Request(transaction);
      await requestUpdate
        .input('cantidad_nueva',  sql.Int,      cantidadNueva)
        .input('fecha',           sql.DateTime, new Date())
        .input('id_producto',     sql.Int,      id_producto)
        .input('id_almacen',      sql.Int,      id_almacen)
        .query(`
          UPDATE STOCK SET
            cantidad_actual     = @cantidad_nueva,
            fecha_actualizacion = @fecha
          WHERE id_producto = @id_producto
          AND   id_almacen  = @id_almacen
        `);

    // Insertamos el movimiento en el historial    
    const requestInsert = new sql.Request(transaction);
        await requestInsert
          .input('id_producto',      sql.Int,     id_producto)
          .input('id_almacen',       sql.Int,     id_almacen)
          .input('tipo',             sql.VarChar, tipo)
          .input('cantidad',         sql.Int,     cantidad)
          .input('stock_anterior',   sql.Int,     cantidadAnterior)
          .input('stock_posterior',  sql.Int,     cantidadNueva)
          .input('tipo_referencia',  sql.VarChar, tipo === 'entrada' ? 'compra' : tipo === 'salida' ? 'venta' : 'ajuste_manual')
          .input('id_usuario',       sql.Int,     id_usuario)
          .input('observacion',      sql.VarChar, observacion || null)
          .query(`
            INSERT INTO MOVIMIENTOS_STOCK 
              (id_producto, id_almacen, tipo, cantidad, stock_anterior, stock_posterior, tipo_referencia, id_usuario, observacion)
            VALUES
              (@id_producto, @id_almacen, @tipo, @cantidad, @stock_anterior, @stock_posterior, @tipo_referencia, @id_usuario, @observacion)
          `);

    // Confirmo las operaciones, si es que no hubo errores
    await transaction.commit();

    // Devuelvo el stock que se va a mostrar en el frontend
    return {
      stock_anterior: cantidadAnterior,
      stock_posterior: cantidadNueva,
      alerta_stock_bajo: cantidadNueva <= 0,
    };

  } catch (error) {
    // Si hubo un error, deshago la transacción
    await transaction.rollback();
    throw error;
  }
};

module.exports = { registrarMovimiento };

/*
- Si en cualquier punto del `try` algo falla, el `catch` ejecuta `transaction.rollback()` que **deshace todo** lo que se haya hecho dentro de la transacción. Si el `UPDATE` de stock funcionó pero el `INSERT` del historial falló, el rollback revierte también el `UPDATE`. La base de datos queda exactamente como estaba antes.
- Después del rollback hacemos `throw error` para re-lanzar el error hacia arriba, para que el controller lo reciba y lo mande como respuesta al cliente.

Así queda el flujo completo del servicio:
```
recibir datos
    ↓
leer stock actual
    ↓
¿existe? → no → error 404
    ↓ sí
calcular stock nuevo
    ↓
¿queda negativo? → sí → error 400
    ↓ no
UPDATE stock
    ↓
INSERT historial
    ↓
¿todo ok? → commit ✅
¿algo falló? → rollback ❌
*/