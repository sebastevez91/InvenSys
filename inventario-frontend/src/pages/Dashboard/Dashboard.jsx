import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import './Dashboard.css';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const formatMoney = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <Layout>
      <div className="dash-loading">Cargando dashboard...</div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="dash-error">{error}</div>
    </Layout>
  );

  const { kpis, ventasPorMes, stockPorCategoria, productosStockBajo } = data;

  return (
    <Layout>
      <div className="dash-wrapper">

        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Resumen general del sistema</p>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="dash-kpis">
          <KpiCard titulo="Productos activos" valor={kpis.totalProductos} color="indigo" icon="📦" />
          <KpiCard titulo="Ventas del mes"    valor={formatMoney(kpis.ventasMes)}  color="green"  icon="💰" />
          <KpiCard titulo="Compras del mes"   valor={formatMoney(kpis.comprasMes)} color="yellow" icon="🛒" />
          <KpiCard titulo="Stock bajo"        valor={kpis.stockBajo}               color="red"    icon="⚠️" />
        </div>

        {/* ── Gráficos ── */}
        <div className="dash-charts">

          <div className="dash-card">
            <h2 className="dash-card-title">Ventas últimos 6 meses</h2>
            {ventasPorMes.length === 0 ? (
              <p className="dash-empty">Sin datos de ventas</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ventasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip formatter={(value) => formatMoney(value)} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="dash-card">
            <h2 className="dash-card-title">Stock por categoría</h2>
            {stockPorCategoria.length === 0 ? (
              <p className="dash-empty">Sin datos de stock</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stockPorCategoria}
                    dataKey="total_stock"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ categoria, percent }) =>
                      `${categoria} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {stockPorCategoria.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* ── Tabla stock bajo ── */}
        <div className="dash-card">
          <h2 className="dash-card-title">
            Productos con stock bajo
            {kpis.stockBajo > 0 && (
              <span className="dash-badge-red">
                {kpis.stockBajo} alerta{kpis.stockBajo > 1 ? 's' : ''}
              </span>
            )}
          </h2>

          {productosStockBajo.length === 0 ? (
            <p className="dash-ok">✅ Todos los productos tienen stock suficiente</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Almacén</th>
                  <th className="text-center">Stock actual</th>
                  <th className="text-center">Punto de reorden</th>
                </tr>
              </thead>
              <tbody>
                {productosStockBajo.map((p, i) => (
                  <tr key={i}>
                    <td className="font-medium">{p.nombre}</td>
                    <td className="muted">{p.nombre_almacen}</td>
                    <td className="text-center">
                      <span className="dash-badge-red">{p.stock}</span>
                    </td>
                    <td className="text-center muted">{p.stock_minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
}

// ── KpiCard ──────────────────────────────────────────────────
function KpiCard({ titulo, valor, color, icon }) {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
        <p className="kpi-titulo">{titulo}</p>
      </div>
      <p className="kpi-valor">{valor}</p>
    </div>
  );
}