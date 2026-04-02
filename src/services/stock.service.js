const { getPool, sql } = require('../config/database');

const registrarMovimiento = async ({ id_producto, id_almacen, tipo, cantidad, id_usuario, observacion }) => {
  const pool = getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
  }
}

export default stock.service