import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api'; // ajustá el path si tu instancia de axios está en otro lado
import Layout from '../components/Layout/Layout';

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

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;
  if (error)   return <div className="p-8 text-center text-red-500">{error}</div>;

  const { kpis, ventasPorMes, stockPorCategoria, productosStockBajo } = data;

  return (
    <Layout>
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard titulo="Productos activos" valor={kpis.totalProductos} color="indigo" />
        <KpiCard titulo="Ventas del mes"    valor={formatMoney(kpis.ventasMes)}   color="green" />
        <KpiCard titulo="Compras del mes"   valor={formatMoney(kpis.comprasMes)}  color="yellow" />
        <KpiCard titulo="Stock bajo"        valor={kpis.stockBajo} color="red" />
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Bar Chart - Ventas por mes */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Ventas últimos 6 meses</h2>
          {ventasPorMes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos de ventas</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart - Stock por categoría */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Stock por categoría</h2>
          {stockPorCategoria.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos de stock</p>
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
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Productos con stock bajo
          {kpis.stockBajo > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {kpis.stockBajo} alerta{kpis.stockBajo > 1 ? 's' : ''}
            </span>
          )}
        </h2>
        {productosStockBajo.length === 0 ? (
          <p className="text-sm text-gray-400">✅ Todos los productos tienen stock suficiente</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Producto</th>
                <th className="pb-2">Almacén</th>
                <th className="pb-2 text-center">Stock actual</th>
                <th className="pb-2 text-center">Punto de reorden</th>
              </tr>
            </thead>
            <tbody>
              {productosStockBajo.map((p, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 font-medium text-gray-800">{p.nombre}</td>
                  <td className="py-2 text-gray-500">{p.nombre_almacen}</td>
                  <td className="py-2 text-center">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-2 text-center text-gray-500">{p.stock_minimo}</td>
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

// Componente auxiliar para las tarjetas KPI
function KpiCard({ titulo, valor, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green:  'bg-green-50  text-green-700  border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red:    'bg-red-50    text-red-700    border-red-200',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{titulo}</p>
      <p className="text-2xl font-bold mt-1">{valor}</p>
    </div>
  );
}
