const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/database');
const { generateToken } = require('../config/jwt');

const login = async (nombre_usuario, contrasena) => {
  const pool = getPool();

  const result = await pool.request()
    .input('nombre_usuario', sql.VarChar, nombre_usuario)
    .query(`
      SELECT id_usuario, nombre_usuario, contrasena_hash, rol, estado
      FROM USUARIOS
      WHERE nombre_usuario = @nombre_usuario
    `);

  const user = result.recordset[0];

  if (!user) throw { status: 401, message: 'Credenciales incorrectas' };
  if (!user.estado) throw { status: 403, message: 'Usuario inactivo' };

  const validPassword = await bcrypt.compare(contrasena, user.contrasena_hash);
  if (!validPassword) throw { status: 401, message: 'Credenciales incorrectas' };

  const token = generateToken({
    id_usuario: user.id_usuario,
    nombre_usuario: user.nombre_usuario,
    rol: user.rol,
  });

  return {
    token,
    usuario: {
      id: user.id_usuario,
      nombre_usuario: user.nombre_usuario,
      rol: user.rol,
    },
  };
};

module.exports = { login };
