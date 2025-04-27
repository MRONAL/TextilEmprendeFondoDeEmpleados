const pool = require('./src/models/DbConexion');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conectado a PostgreSQL:', res.rows[0]);
  } catch (err) {
    console.error('Error conectando a PostgreSQL:', err);
  }
})();
