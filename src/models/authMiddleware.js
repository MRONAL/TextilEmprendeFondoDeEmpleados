// models/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // tu clave secreta
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token inválido:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = verificarToken;
