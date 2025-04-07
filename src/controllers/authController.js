const db = require('../models/DbConexion');

const authController = {
  login: async (req, res) => {
    console.log('BODY:', req.body);
    const { correo, contrasena, rol } = req.body;

    try {
      let query = '';

      if (rol === 'afiliado') {
        query = 'SELECT * FROM afiliado WHERE correo = $1';
      } else if (rol === 'admin' || rol === 'soporte') {
        query = 'SELECT * FROM asesor WHERE correo = $1';
      } else {
        return res.status(400).json({ mensaje: 'Rol inválido' });
      }

      const result = await db.query(query, [correo]);

      if (result.rows.length === 0) {
        return res.status(401).json({ mensaje: 'Usuario no encontrado' });
      }

      const user = result.rows[0];

      if (contrasena !== user.password_hash) {
        return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
      }

      res.status(200).json({
        mensaje: 'Inicio de sesión exitoso',
        usuario: {
          nombre: user.nombre,
          correo: user.correo,
          rol: rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
    }
  }
};

module.exports = authController;

