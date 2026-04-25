import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../../services/productos.service';
import { getCategorias } from '../../services/categorias.service';
import '../../styles/shared.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [paginacion, setPaginacion] = useState({});
  const [categorias, setCategorias] = useState([]);
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

  // Carga categorías una sola vez al montar
  useEffect(() => {
    getCategorias()
      .then(({ data }) => setCategorias(data.datos))
      .catch(console.error);
  }, []);

  useEffect(() => { cargarProductos(); }, [pagina, busqueda]);

  const abrirModal = (producto = null) => {
    if (producto) {
      setForm({
        sku: producto.sku, nombre: producto.nombre,
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

  const cerrarModal = () => { setModal(false); setProductoEditar(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (productoEditar) await updateProducto(productoEditar.id_producto, form);
      else await createProducto(form);
      cerrarModal();
      cargarProductos();
    } catch (error) { console.error(error); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desactivar este producto?')) return;
    try { await deleteProducto(id); cargarProductos(); }
    catch (error) { console.error(error); }
  };

  // Campos de texto del formulario (sin id_categoria, que se maneja aparte)
  const camposTexto = [
    { label: 'SKU',           name: 'sku' },
    { label: 'Nombre',        name: 'nombre' },
    { label: 'Descripción',   name: 'descripcion' },
    { label: 'Precio Venta',  name: 'precio_venta' },
    { label: 'Precio Costo',  name: 'precio_costo' },
    { label: 'Punto Reorden', name: 'punto_reorden' },
  ];

  const requeridos = ['sku', 'nombre', 'id_categoria', 'precio_venta', 'precio_costo'];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">Gestión del catálogo de productos</p>
        </div>
        <button className="btn-primario" onClick={() => abrirModal()}>+ Nuevo Producto</button>
      </div>

      <input
        className="buscador"
        type="text"
        placeholder="Buscar por nombre o SKU..."
        value={busqueda}
        onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
      />

      {cargando ? (
        <p className="estado-cargando">Cargando productos...</p>
      ) : (
        <div className="tabla-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio Venta</th>
                <th className="col-center">Stock</th>
                <th className="col-center">Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id_producto}>
                  <td className="col-mono">{p.sku}</td>
                  <td className="col-bold">{p.nombre}</td>
                  <td>{p.nombre_categoria}</td>
                  <td>${Number(p.precio_venta).toLocaleString()}</td>
                  <td className="col-center">
                    <span className={`badge ${p.stock_bajo ? 'badge-rojo' : 'badge-verde'}`}>
                      {p.stock_total}{p.stock_bajo ? ' ⚠️' : ''}
                    </span>
                  </td>
                  <td className="col-center">
                    <span className={`badge ${p.estado ? 'badge-verde' : 'badge-gris'}`}>
                      {p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-editar" onClick={() => abrirModal(p)}>Editar</button>
                    <button className="btn-eliminar" onClick={() => handleEliminar(p.id_producto)}>Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="paginacion">
        <button className="btn-pag" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>← Anterior</button>
        <span className="pagina-info">Página {paginacion.pagina} de {paginacion.paginas}</span>
        <button className="btn-pag" disabled={pagina === paginacion.paginas} onClick={() => setPagina(p => p + 1)}>Siguiente →</button>
      </div>

      {modal && (
        <div className="overlay">
          <div className="modal">
            <h2 className="modal-titulo">{productoEditar ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <form onSubmit={handleSubmit}>

                {camposTexto.map(({ label, name }) => (
                  <div key={name} className="campo">
                    <label>{label}</label>
                    <input
                      type="text"
                      value={form[name]}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                      required={requeridos.includes(name)}
                    />
                  </div>
              ))}

              {/* Select de categoría */}
              <div className="campo">
                <label>Categoría</label>
                <select
                  value={form.id_categoria}
                  onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}
                  required
                >
                  <option value="">-- Seleccionar categoría --</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-botones">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-primario">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Productos;