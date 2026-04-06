import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menu = [
  { path: '/',            label: '📊 Dashboard'   },
  { path: '/productos',   label: '📦 Productos'   },
  { path: '/categorias',  label: '🏷️ Categorías'  },
  { path: '/proveedores', label: '🏭 Proveedores' },
  { path: '/compras',     label: '🛒 Compras'     },
  { path: '/ventas',      label: '💰 Ventas'      },
];

const Layout = ({ children }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>

      {/* Barra lateral */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <h2 style={styles.logoTexto}>InvenSys</h2>
        </div>

        <nav>
          {menu.map((item) => (
            <div
              key={item.path}
              style={{
                ...styles.menuItem,
                ...(location.pathname === item.path ? styles.menuItemActivo : {}),
              }}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div style={styles.userSection}>
          <p style={styles.userName}>👤 {usuario?.nombre_usuario}</p>
          <p style={styles.userRol}>{usuario?.rol}</p>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={styles.main}>
        {children}
      </main>

    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1a1a2e',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
  },
  logo: {
    padding: '24px 20px',
    borderBottom: '1px solid #2d2d4e',
  },
  logoTexto: {
    color: '#fff',
    margin: 0,
    fontSize: '22px',
    fontWeight: 'bold',
  },
  menuItem: {
    padding: '14px 20px',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  menuItemActivo: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    borderRight: '3px solid #818cf8',
  },
  userSection: {
    marginTop: 'auto',
    padding: '20px',
    borderTop: '1px solid #2d2d4e',
  },
  userName: {
    color: '#fff',
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '600',
  },
  userRol: {
    color: '#aaa',
    margin: '0 0 12px 0',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: 'transparent',
    border: '1px solid #4f46e5',
    color: '#818cf8',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  main: {
    marginLeft: '240px',
    padding: '30px',
    flex: 1,
  },
};

export default Layout;