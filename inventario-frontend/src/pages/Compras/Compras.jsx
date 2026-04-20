import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { getCompras, getCompraById, createCompra } from '../../services/compras.service';
import { getProveedores } from '../../services/proveedores.service';
import '../../styles/shared.css';

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [modal, setModal] = useState(false);
  const [detalleModal, setDetalleModal] = useState(false);
  const [compraDetalle, setCompraDetalle] = useState(null);
  const [form, setForm] = useState({ id_proveedor: '', observaciones: '' });
  const [productos, setProductos] = useState([{ id_producto: '', id_almacen: '', cantidad: '', precio_unitario: '' }]);

  const cargarDatos = async () => {
    try {
      const [comprasRes, provRes] = await Promise.all([getCompras(), getProveedores()]);
      setCompras(comprasRes.data.datos);
      setProveedores(provRes.data.datos);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const verDetalle = async (id) => {
    try {
      const { data } = await getCompraById(id);
      setCompraDetalle(data.dato);
      setDetalleModal(true);
    } catch (error) { console.error(error); }
  };

  const agregarProducto = () =>
    setProductos([...productos, { id_producto: '', id_almacen: '', cantidad: '', precio_unitario: '' }]);

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
      await createCompra({
        ...form,
        productos: productos.map(p => ({
          id_producto: parseInt(p.id_producto),
          id_almacen: parseInt(p.id_almacen),
          cantidad: parseInt(p.cantidad),
          precio_unitario: parseFloat(p.precio_unitario),
        })),
      });
      setModal(false);
      setForm({ id_proveedor: '', observaciones: '' });
      setProductos([{ id_producto: '', id_almacen: '', cantidad: '', precio_unitario: '' }]);
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al registrar compra');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Compras</h1>
          <p className="page-subtitle">Registro de órdenes de compra</p>
        </div>
        <button className="btn-primario" onClick={() => setModal(true)}>+ Nueva Compra</button>
      </div>

      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id_compra}>
                <td className="col-mono">#{c.id_compra}</td>
                <td className="col-bold">{c.proveedor}</td>
                <td>{new Date(c.fecha_compra).toLocaleDateString()}</td>
                <td><span className="badge badge-verde">{c.estado}</span></td>
                <td>${Number(c.total).toLocaleString()}</td>
                <td>
                  <button className="btn-editar" onClick={() => verDetalle(c.id_compra)}>Ver detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nueva compra */}
      {modal && (
        <div className="overlay">
          <div className="modal modal-lg">
            <h2 className="modal-titulo">Nueva Compra</h2>
            <form onSubmit={handleSubmit}>
              <div className="campo">
                <label>Proveedor</label>
                <select
                  value={form.id_proveedor}
                  onChange={(e) => setForm({ ...form, id_proveedor: e.target.value })}
                  required
                >
                  <option value="">— Seleccioná un proveedor —</option>
                  {proveedores.map(p => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre_empresa}</option>
                  ))}
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
                  <input type="number" placeholder="ID Producto"  value={p.id_producto}     onChange={(e) => handleProductoChange(i, 'id_producto', e.target.value)}     required />
                  <input type="number" placeholder="ID Almacén"   value={p.id_almacen}      onChange={(e) => handleProductoChange(i, 'id_almacen', e.target.value)}      required />
                  <input type="number" placeholder="Cantidad"     value={p.cantidad}         onChange={(e) => handleProductoChange(i, 'cantidad', e.target.value)}         required />
                  <input type="number" placeholder="Precio Unit." value={p.precio_unitario}  onChange={(e) => handleProductoChange(i, 'precio_unitario', e.target.value)}  required />
                  {productos.length > 1 && (
                    <button type="button" className="btn-eliminar-fila" onClick={() => eliminarProducto(i)}>✕</button>
                  )}
                </div>
              ))}

              <div className="modal-botones">
                <button type="button" className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primario">Registrar Compra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalleModal && compraDetalle && (
        <div className="overlay">
          <div className="modal modal-lg">
            <h2 className="modal-titulo">Compra #{compraDetalle.id_compra}</h2>
            <p className="detalle-info"><strong>Proveedor:</strong> {compraDetalle.proveedor}</p>
            <p className="detalle-info"><strong>Fecha:</strong> {new Date(compraDetalle.fecha_compra).toLocaleDateString()}</p>
            <p className="detalle-info"><strong>Estado:</strong> {compraDetalle.estado}</p>
            <p className="detalle-info"><strong>Observaciones:</strong> {compraDetalle.observaciones || '—'}</p>
            <div className="tabla-container" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    <th>SKU</th><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {compraDetalle.detalles?.map((d) => (
                    <tr key={d.id_detalle_compra}>
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
            <p className="detalle-total">Total: ${Number(compraDetalle.total).toLocaleString()}</p>
            <div className="modal-botones">
              <button className="btn-primario" onClick={() => setDetalleModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Compras;