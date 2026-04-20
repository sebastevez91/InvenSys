import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { getVentas, getVentaById, createVenta } from '../../services/ventas.service';
import '../../styles/shared.css';

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
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarVentas(); }, []);

  const verDetalle = async (id) => {
    try {
      const { data } = await getVentaById(id);
      setVentaDetalle(data.dato);
      setDetalleModal(true);
    } catch (error) { console.error(error); }
  };

  const agregarProducto = () =>
    setProductos([...productos, { id_producto: '', id_almacen: '', cantidad: '' }]);

  const eliminarProducto = (i) =>
    setProductos(productos.filter((_, idx) => idx !== i));

  const handleProductoChange = (i, field, value) => {
    const nuevos = [...productos];
    nuevos[i][field] = value;
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

  const metodoBadgeClass = (metodo) => {
    const map = {
      efectivo:        'badge-verde',
      tarjeta_credito: 'badge-indigo',
      tarjeta_debito:  'badge-azul',
      transferencia:   'badge-yellow',
      otro:            'badge-gris',
    };
    return map[metodo] || 'badge-gris';
  };

  const metodoLabel = (metodo) => ({
    efectivo: 'Efectivo', tarjeta_credito: 'Tarjeta Crédito',
    tarjeta_debito: 'Tarjeta Débito', transferencia: 'Transferencia', otro: 'Otro',
  }[metodo] || metodo);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ventas</h1>
          <p className="page-subtitle">Registro de transacciones de venta</p>
        </div>
        <button className="btn-primario" onClick={() => setModal(true)}>+ Nueva Venta</button>
      </div>

      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Método de Pago</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id_venta}>
                <td className="col-mono">#{v.id_venta}</td>
                <td className="col-bold">{v.cliente || 'Sin cliente'}</td>
                <td>{new Date(v.fecha_venta).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${metodoBadgeClass(v.metodo_pago)}`}>
                    {metodoLabel(v.metodo_pago)}
                  </span>
                </td>
                <td><span className="badge badge-verde">{v.estado}</span></td>
                <td>${Number(v.total).toLocaleString()}</td>
                <td>
                  <button className="btn-editar" onClick={() => verDetalle(v.id_venta)}>Ver detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nueva venta */}
      {modal && (
        <div className="overlay">
          <div className="modal">
            <h2 className="modal-titulo">Nueva Venta</h2>
            <form onSubmit={handleSubmit}>
              <div className="campo">
                <label>ID Cliente (opcional)</label>
                <input
                  type="number"
                  placeholder="Dejar vacío si no aplica"
                  value={form.id_cliente}
                  onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
                />
              </div>
              <div className="campo">
                <label>Método de Pago</label>
                <select
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
              <div className="campo">
                <label>Observaciones</label>
                <input
                  type="text"
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                />
              </div>

              <div className="productos-header">
                <label>Productos</label>
                <button type="button" className="btn-agregar" onClick={agregarProducto}>+ Agregar</button>
              </div>
              {productos.map((p, i) => (
                <div key={i} className="producto-row">
                  <input type="number" placeholder="ID Producto" value={p.id_producto} onChange={(e) => handleProductoChange(i, 'id_producto', e.target.value)} required />
                  <input type="number" placeholder="ID Almacén"  value={p.id_almacen}  onChange={(e) => handleProductoChange(i, 'id_almacen', e.target.value)}  required />
                  <input type="number" placeholder="Cantidad"    value={p.cantidad}     onChange={(e) => handleProductoChange(i, 'cantidad', e.target.value)}     required />
                  {productos.length > 1 && (
                    <button type="button" className="btn-eliminar-fila" onClick={() => eliminarProducto(i)}>✕</button>
                  )}
                </div>
              ))}

              <div className="modal-botones">
                <button type="button" className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primario">Registrar Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalleModal && ventaDetalle && (
        <div className="overlay">
          <div className="modal">
            <h2 className="modal-titulo">Venta #{ventaDetalle.id_venta}</h2>
            <p className="detalle-info"><strong>Cliente:</strong> {ventaDetalle.cliente || 'Sin cliente'}</p>
            <p className="detalle-info"><strong>Fecha:</strong> {new Date(ventaDetalle.fecha_venta).toLocaleDateString()}</p>
            <p className="detalle-info"><strong>Estado:</strong> {ventaDetalle.estado}</p>
            <p className="detalle-info"><strong>Observaciones:</strong> {ventaDetalle.observaciones || '—'}</p>
            <div className="tabla-container" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    <th>SKU</th><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ventaDetalle.detalles?.map((d) => (
                    <tr key={d.id_detalle_venta}>
                      <td className="col-mono">{d.sku}</td>
                      <td>{d.producto}</td>
                      <td>{d.cantidad}</td>
                      <td>${Number(d.precio_unitario).toLocaleString()}</td>
                      <td>${Number(d.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="detalle-total">Total: ${Number(ventaDetalle.total).toLocaleString()}</p>
            <div className="modal-botones">
              <button className="btn-primario" onClick={() => setDetalleModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Ventas;