import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

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
    <div  className='container-layout'>

      {/* Barra lateral */}
      <aside className='sidebar'>
        <div className='logo'>
          <h2 className='logo-texto'>InvenSys</h2>
        </div>

        <nav>
          {menu.map((item) => (
            <div
              key={item.path}
              className={location.pathname === item.path ? 'menu-item-activo' : 'menu-item'}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className='user-section'>
          <p className='user-name'>👤 {usuario?.nombre_usuario}</p>
          <p className='user-rol'>{usuario?.rol}</p>
          <button className='logout-btn' onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className='main'>
        {children}
      </main>

    </div>
  );
};

export default Layout;