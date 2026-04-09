import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (las vamos a crear después)

import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos/Productos';
import Categorias from './pages/Categorias/Categorias';
import Proveedores from './pages/Proveedores';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Login from './pages/Login/Login';

// Ruta protegida: redirige al login si no hay sesión
const PrivateRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/productos" element={<PrivateRoute><Productos /></PrivateRoute>} />
      <Route path="/categorias" element={<PrivateRoute><Categorias /></PrivateRoute>} />
      <Route path="/proveedores" element={<PrivateRoute><Proveedores /></PrivateRoute>} />
      <Route path="/compras" element={<PrivateRoute><Compras /></PrivateRoute>} />
      <Route path="/ventas" element={<PrivateRoute><Ventas /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;