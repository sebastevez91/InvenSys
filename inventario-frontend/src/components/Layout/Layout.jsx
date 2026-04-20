import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const menu = [
  { path: '/',            label: 'Dashboard',   icon: '📊' },
  { path: '/productos',   label: 'Productos',   icon: '📦' },
  { path: '/categorias',  label: 'Categorías',  icon: '🏷️' },
  { path: '/proveedores', label: 'Proveedores', icon: '🏭' },
  { path: '/compras',     label: 'Compras',     icon: '🛒' },
  { path: '/ventas',      label: 'Ventas',      icon: '💰' },
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
    <div className="container-layout">

      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">IS</div>
          <div>
            <h2 className="logo-texto">InvenSys</h2>
            <span className="logo-sub">Gestión de Inventario</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          <p className="nav-label">MENÚ PRINCIPAL</p>
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                className={isActive ? 'menu-item menu-item-activo' : 'menu-item'}
                onClick={() => navigate(item.path)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {isActive && <span className="menu-indicator" />}
              </div>
            );
          })}
        </nav>

        <div className="user-section">
          <div className="sidebar-divider" />
          <div className="user-info">
            <div className="user-avatar">
              {usuario?.nombre_usuario?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="user-details">
              <p className="user-name">{usuario?.nombre_usuario}</p>
              <p className="user-rol">{usuario?.rol}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>⎋</span> Cerrar sesión
          </button>
        </div>

      </aside>

      <main className="main">
        {children}
      </main>

    </div>
  );
};

export default Layout;