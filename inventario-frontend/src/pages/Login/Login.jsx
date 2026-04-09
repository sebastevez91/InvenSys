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
    <div className="container">
      <div className="card">
        <h1>InvenSys</h1>
        <p className="subtitulo">Sistema de Gestión de Inventario</p>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>Usuario</label>
            <input
              type="text"
              name="nombre_usuario"
              value={form.nombre_usuario}
              onChange={handleChange}
              placeholder="Ingresá tu usuario"
              required
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="Ingresá tu contraseña"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};


export default Login;