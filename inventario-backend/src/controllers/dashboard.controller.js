// src/controllers/dashboard.controller.js
const { getPool } = require('../config/database');

const getDashboardData = async (req, res) => {
  try {
    const pool = await getPool();

    // KPI: total de productos activos
    const totalProductos = await pool.request()
      .query(`SELECT COUNT(*) as total FROM PRODUCTOS WHERE estado = 1`);

    // KPI: ventas del mes actual (solo completadas)
    const ventasMes = await pool.request()
      .query(`
        SELECT ISNULL(SUM(total), 0) as total
        FROM VENTAS
        WHERE estado = 'completada'
          AND MONTH(fecha_venta) = MONTH(GETDATE())
          AND YEAR(fecha_venta) = YEAR(GETDATE())
      `);

    // KPI: compras del mes actual (solo recibidas)
    const comprasMes = await pool.request()
      .query(`
        SELECT ISNULL(SUM(total), 0) as total
        FROM COMPRAS
        WHERE estado = 'recibida'
          AND MONTH(fecha_compra) = MONTH(GETDATE())
          AND YEAR(fecha_compra) = YEAR(GETDATE())
      `);

    // KPI: productos con stock bajo (usando la vista que ya tenés)
    const stockBajo = await pool.request()
      .query(`SELECT COUNT(*) as total FROM VW_STOCK_BAJO`);

    // GRÁFICO: ventas por mes (últimos 6 meses)
    const ventasPorMes = await pool.request()
      .query(`
        SELECT
          FORMAT(fecha_venta, 'MMM', 'es-AR') as mes,
          MONTH(fecha_venta) as num_mes,
          YEAR(fecha_venta) as anio,
          SUM(total) as total
        FROM VENTAS
        WHERE estado = 'completada'
          AND fecha_venta >= DATEADD(MONTH, -5, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
        GROUP BY YEAR(fecha_venta), MONTH(fecha_venta), FORMAT(fecha_venta, 'MMM', 'es-AR')
        ORDER BY anio, num_mes
      `);

    // GRÁFICO: stock por categoría
    const stockPorCategoria = await pool.request()
      .query(`
        SELECT
          c.nombre_categoria as categoria,
          SUM(s.cantidad_actual) as total_stock
        FROM STOCK s
        INNER JOIN PRODUCTOS p   ON s.id_producto  = p.id_producto
        INNER JOIN CATEGORIAS c  ON p.id_categoria = c.id_categoria
        WHERE p.estado = 1
        GROUP BY c.nombre_categoria
      `);

    // TABLA: detalle productos con stock bajo (usando la vista)
    const productosStockBajo = await pool.request()
      .query(`
        SELECT TOP 5
          nombre,
          cantidad_actual as stock,
          punto_reorden as stock_minimo,
          nombre_almacen
        FROM VW_STOCK_BAJO
        ORDER BY cantidad_actual ASC
      `);

    res.json({
      kpis: {
        totalProductos: totalProductos.recordset[0].total,
        ventasMes: ventasMes.recordset[0].total,
        comprasMes: comprasMes.recordset[0].total,
        stockBajo: stockBajo.recordset[0].total,
      },
      ventasPorMes: ventasPorMes.recordset,
      stockPorCategoria: stockPorCategoria.recordset,
      productosStockBajo: productosStockBajo.recordset,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener datos del dashboard', error: error.message });
  }
};

module.exports = { getDashboardData };