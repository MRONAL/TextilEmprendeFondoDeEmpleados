// models/asesor.js
const pool = require('./DbConexion'); // tu conexión a PostgreSQL


const obtenerTicketsPorAsesor = async (id_asesor) => {
  const query = `
    SELECT 
      t.id_ticket, 
      t.categoria, 
      t.descripcion, 
      t.estado, 
      t.fecha_creacion,
      a.id_afiliado,
      a.nombre AS nombre_afiliado,
      a.correo AS correo_afiliado
    FROM ticket t
    JOIN afiliado a ON t.id_afiliado = a.id_afiliado
    WHERE t.id_asesor = $1
    ORDER BY t.fecha_creacion DESC;
  `;
  const result = await pool.query(query, [id_asesor]);
  return result.rows;
};

const verificarPropiedadTicket = async (id_ticket, id_asesor) => {
  const query = `
    SELECT 1 FROM ticket 
    WHERE id_ticket = $1 AND id_asesor = $2
  `;
  const result = await pool.query(query, [id_ticket, id_asesor]);
  return result.rowCount > 0;
};

const actualizarTicketPorAsesor = async (id_ticket, id_asesor, estado, descripcion) => {
  const esPropietario = await verificarPropiedadTicket(id_ticket, id_asesor);
  if (!esPropietario) return null;

  const query = `
    UPDATE ticket
    SET estado = $1, descripcion = $2, updated_at = NOW()
    WHERE id_ticket = $3
  `;
  const result = await pool.query(query, [estado, descripcion, id_ticket]);
  return result;
};


module.exports = {
  obtenerTicketsPorAsesor, actualizarTicketPorAsesor 
};