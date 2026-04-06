import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/productos.service';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [paginacion, setPaginacion] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [form, setForm] = useState({
    sku: '', nombre: '', descripcion: '',
    id_categoria: '', precio_venta: '',
    precio_costo: '', punto_reorden: '',
  });

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const { data } = await getProductos({ pagina, limite: 10, busqueda });
      setProductos(data.datos);
      setPaginacion(data.paginacion);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [pagina, busqueda]);

  const abrirModal = (producto = null) => {
    if (producto) {
      setForm({
        sku: producto.sku,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        id_categoria: producto.id_categoria,
        precio_venta: producto.precio_venta,
        precio_costo: producto.precio_costo,
        punto_reorden: producto.punto_reorden,
      });
      setProductoEditar(producto);
    } else {
      setForm({ sku: '', nombre: '', descripcion: '', id_categoria: '', precio_venta: '', precio_costo: '', punto_reorden: '' });
      setProductoEditar(null);
    }
    setModal(true);
  };

  const cerrarModal = () => {
    setModal(false);
    setProductoEditar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (productoEditar) {
        await updateProducto(productoEditar.id_producto, form);
      } else {
        await createProducto(form);
      }
      cerrarModal();
      cargarProductos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desactivar este producto?')) return;
    try {
      await deleteProducto(id);
      cargarProductos();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.titulo}>Productos</h1>
        <button style={styles.btnPrimario} onClick={() => abrirModal()}>+ Nuevo Producto</button>
      </div>

      <input
        style={styles.buscador}
        type="text"
        placeholder="Buscar por nombre o SKU..."
        value={busqueda}
        onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
      />

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div style={styles.tablaContainer}>
          <table style={styles.tabla}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Precio Venta</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id_producto} style={styles.tr}>
                  <td style={styles.td}>{p.sku}</td>
                  <td style={styles.td}>{p.nombre}</td>
                  <td style={styles.td}>{p.nombre_categoria}</td>
                  <td style={styles.td}>${Number(p.precio_venta).toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(p.stock_bajo ? styles.badgeRojo : styles.badgeVerde) }}>
                      {p.stock_total} {p.stock_bajo ? '⚠️' : ''}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(p.estado ? styles.badgeVerde : styles.badgeGris) }}>
                      {p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnEditar} onClick={() => abrirModal(p)}>Editar</button>
                    <button style={styles.btnEliminar} onClick={() => handleEliminar(p.id_producto)}>Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <div style={styles.paginacion}>
        <button style={styles.btnPag} disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>← Anterior</button>
        <span style={styles.paginaInfo}>Página {paginacion.pagina} de {paginacion.paginas}</span>
        <button style={styles.btnPag} disabled={pagina === paginacion.paginas} onClick={() => setPagina(p => p + 1)}>Siguiente →</button>
      </div>

      {/* Modal */}
      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitulo}>{productoEditar ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'SKU', name: 'sku' },
                { label: 'Nombre', name: 'nombre' },
                { label: 'Descripción', name: 'descripcion' },
                { label: 'ID Categoría', name: 'id_categoria' },
                { label: 'Precio Venta', name: 'precio_venta' },
                { label: 'Precio Costo', name: 'precio_costo' },
                { label: 'Punto Reorden', name: 'punto_reorden' },
              ].map(({ label, name }) => (
                <div key={name} style={styles.campo}>
                  <label style={styles.label}>{label}</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    required={['sku', 'nombre', 'id_categoria', 'precio_venta', 'precio_costo'].includes(name)}
                  />
                </div>
              ))}
              <div style={styles.modalBotones}>
                <button type="button" style={styles.btnCancelar} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" style={styles.btnPrimario}>Guardar</button>
              </div>
            </form>
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
  buscador: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box' },
  tablaContainer: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8f9fa' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeVerde: { backgroundColor: '#d1fae5', color: '#065f46' },
  badgeRojo: { backgroundColor: '#fee2e2', color: '#991b1b' },
  badgeGris: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  btnEditar: { backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '6px' },
  btnEliminar: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  paginacion: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
  btnPag: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px' },
  paginaInfo: { fontSize: '14px', color: '#555' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitulo: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1a1a2e' },
  campo: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#333' },
  input: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  modalBotones: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  btnCancelar: { padding: '9px 18px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' },
};

export default Productos;