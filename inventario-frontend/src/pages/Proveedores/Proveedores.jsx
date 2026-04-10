import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../services/proveedores.service';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [modal, setModal] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [form, setForm] = useState({ nombre_empresa: '', contacto: '', telefono: '', email: '', direccion: '' });

  const cargarProveedores = async () => {
    try {
      const { data } = await getProveedores();
      setProveedores(data.datos);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { cargarProveedores(); }, []);

  const abrirModal = (proveedor = null) => {
    if (proveedor) {
      setForm({
        nombre_empresa: proveedor.nombre_empresa,
        contacto: proveedor.contacto || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
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
      if (proveedorEditar) {
        await updateProveedor(proveedorEditar.id_proveedor, { ...form, estado: proveedorEditar.estado });
      } else {
        await createProveedor(form);
      }
      cerrarModal();
      cargarProveedores();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desactivar este proveedor?')) return;
    try {
      await deleteProveedor(id);
      cargarProveedores();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al desactivar');
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.titulo}>Proveedores</h1>
        <button style={styles.btnPrimario} onClick={() => abrirModal()}>+ Nuevo Proveedor</button>
      </div>

      <div style={styles.tablaContainer}>
        <table style={styles.tabla}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Empresa</th>
              <th style={styles.th}>Contacto</th>
              <th style={styles.th}>Teléfono</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Productos</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id_proveedor} style={styles.tr}>
                <td style={styles.td}>{p.nombre_empresa}</td>
                <td style={styles.td}>{p.contacto || '—'}</td>
                <td style={styles.td}>{p.telefono || '—'}</td>
                <td style={styles.td}>{p.email || '—'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...styles.badgeAzul }}>{p.total_productos}</span>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...(p.estado ? styles.badgeVerde : styles.badgeGris) }}>
                    {p.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button style={styles.btnEditar} onClick={() => abrirModal(p)}>Editar</button>
                  <button style={styles.btnEliminar} onClick={() => handleEliminar(p.id_proveedor)}>Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitulo}>{proveedorEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Empresa', name: 'nombre_empresa', required: true },
                { label: 'Contacto', name: 'contacto' },
                { label: 'Teléfono', name: 'telefono' },
                { label: 'Email', name: 'email' },
                { label: 'Dirección', name: 'direccion' },
              ].map(({ label, name, required }) => (
                <div key={name} style={styles.campo}>
                  <label style={styles.label}>{label}</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    required={required}
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
  tablaContainer: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8f9fa' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  badgeVerde: { backgroundColor: '#d1fae5', color: '#065f46' },
  badgeGris: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  badgeAzul: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
  btnEditar: { backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '6px' },
  btnEliminar: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '440px' },
  modalTitulo: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1a1a2e' },
  campo: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#333' },
  input: { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  modalBotones: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  btnCancelar: { padding: '9px 18px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' },
};

export default Proveedores;