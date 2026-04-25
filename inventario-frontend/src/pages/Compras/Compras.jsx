import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { getCompras, getCompraById, createCompra } from '../../services/compras.service';
import { getProveedores } from '../../services/proveedores.service';
import { getProductos } from '../../services/productos.service';
import { getAlmacenes } from '../../services/almacenes.service';
import '../../styles/shared.css';

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [modal, setModal] = useState(false);
  const [detalleModal, setDetalleModal] = useState(false);
  const [compraDetalle, setCompraDetalle] = useState(null);
  const [form, setForm] = useState({ id_proveedor: '', observaciones: '' });
  const [lineas, setLineas] = useState([
    { id_producto: '', id_almacen: '', cantidad: '', precio_unitario: '' }
  ]);

  const cargarDatos = async () => {
    try {
      const [comprasRes, provRes] = await Promise.all([getCompras(), getProveedores()]);
      setCompras(comprasRes.data.datos);
      setProveedores(provRes.data.datos);
    } catch (error) { console.error(error); }
  };

  // Carga productos y almacenes una sola vez al montar
  useEffect(() => {
    Promise.all([getProductos({ limite: 1000 }), getAlmacenes()])
      .then(([prodRes, almRes]) => {
        setProductos(prodRes.data.datos);
        setAlmacenes(almRes.data.datos);
      })
      .catch(console.error);
  }, []);

  useEffect(() => { cargarDatos(); }, []);

  const verDetalle = async (id) => {
    try {
      const { data } = await getCompraById(id);
      setCompraDetalle(data.dato);
      setDetalleModal(true);
    } catch (error) { console.error(error); }
  };

  const agregarLinea = () =>
    setLineas([...lineas, { id_producto: '', id_almacen: '', cantidad: '', precio_unitario: '' }]);

  const eliminarLinea = (i) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

  const handleLineaChange = (i, field, value) => {
    const nuevas = [...lineas];
    nuevas[i][field] = value;

    // Al seleccionar producto, pre-completar precio_unitario con precio_costo
    if (field === 'id_producto' && value) {
      const prod = productos.find(p => p.id_producto === parseInt(value));
      if (prod) nuevas[i].precio_unitario = prod.precio_costo;
    }

    setLineas(nuevas);
  };

  const resetModal = () => {
    setForm({ id_proveedor: '', observaciones: '' });
    setLineas([{ id_producto: '', id_almacen: '', cantidad: '', precio_unitario: '' }]);
    setModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCompra({
        ...form,
        productos: lineas.map(l => ({
          id_producto:     parseInt(l.id_producto),
          id_almacen:      parseInt(l.id_almacen),
          cantidad:        parseInt(l.cantidad),
          precio_unitario: parseFloat(l.precio_unitario),
        })),
      });
      resetModal();
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
                <button type="button" className="btn-agregar" onClick={agregarLinea}>+ Agregar</button>
              </div>

              {lineas.map((linea, i) => (
                <div key={i} className="producto-row">

                  <select
                    value={linea.id_producto}
                    onChange={(e) => handleLineaChange(i, 'id_producto', e.target.value)}
                    required
                  >
                    <option value="">— Producto —</option>
                    {productos.map(p => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.sku} — {p.nombre}
                      </option>
                    ))}
                  </select>

                  <select
                    value={linea.id_almacen}
                    onChange={(e) => handleLineaChange(i, 'id_almacen', e.target.value)}
                    required
                  >
                    <option value="">— Almacén —</option>
                    {almacenes.map(a => (
                      <option key={a.id_almacen} value={a.id_almacen}>
                        {a.nombre_almacen}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Cantidad"
                    min="1"
                    value={linea.cantidad}
                    onChange={(e) => handleLineaChange(i, 'cantidad', e.target.value)}
                    required
                  />

                  <input
                    type="number"
                    placeholder="Precio Unit."
                    min="0"
                    step="0.01"
                    value={linea.precio_unitario}
                    onChange={(e) => handleLineaChange(i, 'precio_unitario', e.target.value)}
                    required
                  />

                  {lineas.length > 1 && (
                    <button type="button" className="btn-eliminar-fila" onClick={() => eliminarLinea(i)}>✕</button>
                  )}
                </div>
              ))}

              <div className="modal-botones">
                <button type="button" className="btn-cancelar" onClick={resetModal}>Cancelar</button>
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