import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../services/categorias.service';
import '../../styles/shared.css';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [form, setForm] = useState({ nombre_categoria: '', descripcion: '', id_categoria_padre: '' });

  const cargarCategorias = async () => {
    try {
      const { data } = await getCategorias();
      setCategorias(data.datos);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarCategorias(); }, []);

  const abrirModal = (categoria = null) => {
    if (categoria) {
      setForm({
        nombre_categoria: categoria.nombre_categoria,
        descripcion: categoria.descripcion || '',
        id_categoria_padre: categoria.id_categoria_padre || '',
      });
      setCategoriaEditar(categoria);
    } else {
      setForm({ nombre_categoria: '', descripcion: '', id_categoria_padre: '' });
      setCategoriaEditar(null);
    }
    setModal(true);
  };

  const cerrarModal = () => { setModal(false); setCategoriaEditar(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (categoriaEditar) await updateCategoria(categoriaEditar.id_categoria, form);
      else await createCategoria(form);
      cerrarModal();
      cargarCategorias();
    } catch (error) { console.error(error); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try { await deleteCategoria(id); cargarCategorias(); }
    catch (error) { alert(error.response?.data?.message || 'Error al eliminar'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">Organización del catálogo</p>
        </div>
        <button className="btn-primario" onClick={() => abrirModal()}>+ Nueva Categoría</button>
      </div>

      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría Padre</th>
              <th className="col-center">Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id_categoria}>
                <td className="col-mono">{c.id_categoria}</td>
                <td className="col-bold">{c.nombre_categoria}</td>
                <td>{c.descripcion || '—'}</td>
                <td>{c.categoria_padre || '—'}</td>
                <td className="col-center">
                  <span className="badge badge-azul">{c.total_productos}</span>
                </td>
                <td>
                  <button className="btn-editar" onClick={() => abrirModal(c)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => handleEliminar(c.id_categoria)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="overlay">
          <div className="modal">
            <h2 className="modal-titulo">{categoriaEditar ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="campo">
                <label>Nombre</label>
                <input
                  type="text"
                  value={form.nombre_categoria}
                  onChange={(e) => setForm({ ...form, nombre_categoria: e.target.value })}
                  required
                />
              </div>
              <div className="campo">
                <label>Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div className="campo">
                <label>Categoría Padre (opcional)</label>
                <select
                  value={form.id_categoria_padre}
                  onChange={(e) => setForm({ ...form, id_categoria_padre: e.target.value })}
                >
                  <option value="">— Sin padre —</option>
                  {categorias
                    .filter(c => c.id_categoria !== categoriaEditar?.id_categoria)
                    .map(c => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre_categoria}
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

export default Categorias;