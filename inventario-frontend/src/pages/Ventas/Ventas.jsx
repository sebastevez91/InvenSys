import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { getVentas, getVentaById, createVenta } from '../../services/ventas.service';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [modal, setModal] = useState(false);
  const [detalleModal, setDetalleModal] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [form, setForm] = useState({ id_cliente: '', metodo_pago: 'efectivo', observaciones: '' });
  const [productos, setProductos] = useState([{ id_producto: '', id_almacen: '', cantidad: '' }]);

  const cargarVentas = async () => {
    try {
      const { data } = await getVentas();
      setVentas(data.datos);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { cargarVentas(); }, []);

  const verDetalle = async (id) => {
    try {
      const { data } = await getVentaById(id);
      setVentaDetalle(data.dato);
      setDetalleModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const agregarProducto = () => {
    setProductos([...productos, { id_producto: '', id_almacen: '', cantidad: '' }]);
  };

  const eliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const handleProductoChange = (index, field, value) => {
    const nuevos = [...productos];
    nuevos[index][field] = value;
    setProductos(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVenta({
        ...form,
        id_cliente: form.id_cliente ? parseInt(form.id_cliente) : null,
        productos: productos.map(p => ({
          id_producto: parseInt(p.id_producto),
          id_almacen: parseInt(p.id_almacen),
          cantidad: parseInt(p.cantidad),
        })),
      });
      setModal(false);
      setForm({ id_cliente: '', metodo_pago: 'efectivo', observaciones: '' });
      setProductos([{ id_producto: '', id_almacen: '', cantidad: '' }]);
      cargarVentas();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al registrar venta');
    }
  };

  const metodoPagoBadge = (metodo) => {
    const colores = {
      efectivo:        { bg: '#d1fae5', color: '#065f46' },
      tarjeta_credito: { bg: '#e0e7ff', color: '#4f46e5' },
      tarjeta_debito:  { bg: '#dbeafe', color: '#1e40af' },
      transferencia:   { bg: '#fef3c7', color: '#92400e' },
      otro:            { bg: '#f3f4f6', color: '#6b7280' },
    };
    return colores[metodo] || colores.otro;
  };

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.titulo}>Ventas</h1>
        <button style={styles.btnPrimario} onClick={() => setModal(true)}>+ Nueva Venta</button>
      </div>

      <div style={styles.tablaContainer}>
        <table style={styles.tabla}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Cliente</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id_venta} style={styles.tr}>
                <td style={styles.td}>#{v.id_venta}</td>
                <td style={styles.td}>{v.cliente || 'Sin cliente'}</td>
                <td style={styles.td}>{new Date(v.fecha_venta).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...styles.badgeVerde }}>{v.estado}</span>
                </td>
                <td style={styles.td}>${Number(v.total).toLocaleString()}</td>
                <td style={styles.td}>
                  <button style={styles.btnEditar} onClick={() => verDetalle(v.id_venta)}>Ver detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nueva venta */}
      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitulo}>Nueva Venta</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.campo}>
                <label style={styles.label}>ID Cliente (opcional)</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Dejar vacío si no aplica"
                  value={form.id_cliente}
                  onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
                />
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Método de Pago</label>
                <select
                  style={styles.input}
                  value={form.metodo_pago}
                  onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta_credito">Tarjeta de Crédito</option>
                  <option value="tarjeta_debito">Tarjeta de Débito</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Observaciones</label>
                <input
                  style={styles.input}
                  type="text"
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={styles.label}>Productos</label>
                  <button type="button" style={styles.btnAgregar} onClick={agregarProducto}>+ Agregar</button>
                </div>
                {productos.map((p, i) => (
                  <div key={i} style={styles.productoRow}>
                    <input style={styles.inputSmall} type="number" placeholder="ID Producto" value={p.id_producto} onChange={(e) => handleProductoChange(i, 'id_producto', e.target.value)} required />
                    <input style={styles.inputSmall} type="number" placeholder="ID Almacén" value={p.id_almacen} onChange={(e) => handleProductoChange(i, 'id_almacen', e.target.value)} required />
                    <input style={styles.inputSmall} type="number" placeholder="Cantidad" value={p.cantidad} onChange={(e) => handleProductoChange(i, 'cantidad', e.target.value)} required />
                    {productos.length > 1 && (
                      <button type="button" style={styles.btnEliminarFila} onClick={() => eliminarProducto(i)}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              <div style={styles.modalBotones}>
                <button type="button" style={styles.btnCancelar} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" style={styles.btnPrimario}>Registrar Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalleModal && ventaDetalle && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitulo}>Venta #{ventaDetalle.id_venta}</h2>
            <p style={styles.detalleInfo}><strong>Cliente:</strong> {ventaDetalle.cliente || 'Sin cliente'}</p>
            <p style={styles.detalleInfo}><strong>Fecha:</strong> {new Date(ventaDetalle.fecha_venta).toLocaleDateString()}</p>
            <p style={styles.detalleInfo}><strong>Estado:</strong> {ventaDetalle.estado}</p>
            <p style={styles.detalleInfo}><strong>Observaciones:</strong> {ventaDetalle.observaciones || '—'}</p>
            <table style={{ ...styles.tabla, marginTop: '16px' }}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>SKU</th>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio Unit.</th>
                  <th style={styles.th}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {ventaDetalle.detalles?.map((d) => (
                  <tr key={d.id_detalle_venta} style={styles.tr}>
                    <td style={styles.td}>{d.sku}</td>
                    <td style={styles.td}>{d.producto}</td>
                    <td style={styles.td}>{d.cantidad}</td>
                    <td style={styles.td}>${Number(d.precio_unitario).toLocaleString()}</td>
                    <td style={styles.td}>${Number(d.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: 'right', marginTop: '12px', fontWeight: 'bold', fontSize: '16px' }}>
              Total: ${Number(ventaDetalle.total).toLocaleString()}
            </p>
            <div style={styles.modalBotones}>
              <button style={styles.btnPrimario} onClick={() => setDetalleModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titulo: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' },
  btnPrimario: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  tablaContainer: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8f9fa' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeVerde: { backgroundColor: '#d1fae5', color: '#065f46' },
  btnEditar: { backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitulo: { fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1a1a2e' },
  campo: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#333' },
  input: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  productoRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
  inputSmall: { flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' },
  btnAgregar: { backgroundColor: '#d1fae5', color: '#065f46', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  btnEliminarFila: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  modalBotones: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  btnCancelar: { padding: '9px 18px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' },
  detalleInfo: { marginBottom: '6px', fontSize: '14px', color: '#333' },
};

export default Ventas;