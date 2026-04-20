import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../services/proveedores.service';
import '../../styles/shared.css';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [modal, setModal] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [form, setForm] = useState({ nombre_empresa: '', contacto: '', telefono: '', email: '', direccion: '' });

  const cargarProveedores = async () => {
    try {
      const { data } = await getProveedores();
      setProveedores(data.datos);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarProveedores(); }, []);

  const abrirModal = (proveedor = null) => {
    if (proveedor) {
      setForm({
        nombre_empresa: proveedor.nombre_empresa,
        contacto:  proveedor.contacto  || '',
        telefono:  proveedor.telefono  || '',
        email:     proveedor.email     || '',
        direccion: proveedor.direccion || '',
      });
      setProveedorEditar(proveedor);
    } else {
      setForm({ nombre_empresa: '', contacto: '', telefono: '', email: '', direccion: '' });
      setProveedorEditar(null);
    }
    setModal(true);
  };

  const cerrarModal = () => { setModal(false); setProveedorEditar(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (proveedorEditar) await updateProveedor(proveedorEditar.id_proveedor, { ...form, estado: proveedorEditar.estado });
      else await createProveedor(form);
      cerrarModal();
      cargarProveedores();
    } catch (error) { console.error(error); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desactivar este proveedor?')) return;
    try { await deleteProveedor(id); cargarProveedores(); }
    catch (error) { alert(error.response?.data?.message || 'Error al desactivar'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Proveedores</h1>
          <p className="page-subtitle">Gestión de proveedores activos</p>
        </div>
        <button className="btn-primario" onClick={() => abrirModal()}>+ Nuevo Proveedor</button>
      </div>

      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th className="col-center">Productos</th>
              <th className="col-center">Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id_proveedor}>
                <td className="col-bold">{p.nombre_empresa}</td>
                <td>{p.contacto  || '—'}</td>
                <td>{p.telefono  || '—'}</td>
                <td>{p.email     || '—'}</td>
                <td className="col-center">
                  <span className="badge badge-azul">{p.total_productos}</span>
                </td>
                <td className="col-center">
                  <span className={`badge ${p.estado ? 'badge-verde' : 'badge-gris'}`}>
                    {p.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn-editar"   onClick={() => abrirModal(p)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => handleEliminar(p.id_proveedor)}>Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="overlay">
          <div className="modal">
            <h2 className="modal-titulo">
              {proveedorEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Empresa',    name: 'nombre_empresa', required: true },
                { label: 'Contacto',   name: 'contacto' },
                { label: 'Teléfono',   name: 'telefono' },
                { label: 'Email',      name: 'email' },
                { label: 'Dirección',  name: 'direccion' },
              ].map(({ label, name, required }) => (
                <div key={name} className="campo">
                  <label>{label}</label>
                  <input
                    type="text"
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    required={required}
                  />
                </div>
              ))}
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

export default Proveedores;