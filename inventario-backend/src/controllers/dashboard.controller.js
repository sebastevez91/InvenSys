const { getConnection } = require('../config/database');

const getDashboardData = async (req, res) => {
  try {
    const pool = await getConnection();

    // KPI: total de productos
    const totalProductos = await pool.request()
      .query('SELECT COUNT(*) as total FROM Productos');

    // KPI: ventas del mes actual
    const ventasMes = await pool.request()
      .query(`
        SELECT ISNULL(SUM(total), 0) as total
        FROM Ventas
        WHERE MONTH(fecha) = MONTH(GETDATE())
        AND YEAR(fecha) = YEAR(GETDATE())
      `);

    // KPI: compras del mes actual
    const comprasMes = await pool.request()
      .query(`
        SELECT ISNULL(SUM(total), 0) as total
        FROM Compras
        WHERE MONTH(fecha) = MONTH(GETDATE())
        AND YEAR(fecha) = YEAR(GETDATE())
      `);

    // KPI: productos con stock bajo
    const stockBajo = await pool.request()
      .query(`
        SELECT COUNT(*) as total
        FROM Productos
        WHERE stock <= stock_minimo
      `);

    // GRÁFICO: ventas por mes (últimos 6 meses)
    const ventasPorMes = await pool.request()
      .query(`
        SELECT 
          FORMAT(fecha, 'MMM', 'es-AR') as mes,
          MONTH(fecha) as num_mes,
          YEAR(fecha) as anio,
          SUM(total) as total
        FROM Ventas
        WHERE fecha >= DATEADD(MONTH, -5, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
        GROUP BY YEAR(fecha), MONTH(fecha), FORMAT(fecha, 'MMM', 'es-AR')
        ORDER BY anio, num_mes
      `);

    // GRÁFICO: stock por categoría
    const stockPorCategoria = await pool.request()
      .query(`
        SELECT 
          c.nombre as categoria,
          SUM(p.stock) as total_stock
        FROM Productos p
        INNER JOIN Categorias c ON p.id_categoria = c.id_categoria
        GROUP BY c.nombre
      `);

    // TABLA: productos con stock bajo (detalle)
    const productosStockBajo = await pool.request()
      .query(`
        SELECT TOP 5 nombre, stock, stock_minimo
        FROM Productos
        WHERE stock <= stock_minimo
        ORDER BY stock ASC
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