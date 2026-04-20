import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ nombre_usuario: '', contrasena: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.usuario);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">

        <div className="login-logo">
          <div className="login-logo-icon">IS</div>
        </div>

        <h1 className="login-title">InvenSys</h1>
        <p className="login-subtitle">Sistema de Gestión de Inventario</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-campo">
            <label>Usuario</label>
            <input
              type="text"
              name="nombre_usuario"
              value={form.nombre_usuario}
              onChange={handleChange}
              placeholder="Ingresá tu usuario"
              required
              autoComplete="username"
            />
          </div>

          <div className="login-campo">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="Ingresá tu contraseña"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={cargando}>
            {cargando ? (
              <span className="login-loading">
                <span className="login-spinner" /> Ingresando...
              </span>
            ) : 'Ingresar'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;