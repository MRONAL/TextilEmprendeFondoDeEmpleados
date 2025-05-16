//models/tickets.js
const pool = require('./DbConexion'); // tu conexión a PostgreSQL

const crearTicket = async (usuario_id, categoria, descripcion) => {
  const query = `
    INSERT INTO ticket (id_afiliado, categoria, descripcion, estado, fecha_creacion)
    VALUES ($1, $2, $3, 'pendiente', NOW())
    RETURNING *;
  `;
  const values = [usuario_id, categoria, descripcion];
  const result = await pool.query(query, values);
  return result.rows[0];
};
const obtenerTicketsPorAfiliado = async (id_afiliado) => {
  const query = `
    SELECT id_ticket, categoria, descripcion, estado, fecha_creacion
    FROM ticket
    WHERE id_afiliado = $1
    ORDER BY fecha_creacion DESC;
  `;
  const result = await pool.query(query, [id_afiliado]);
  return result.rows;
};

// Guardar mensaje
const guardarMensaje = async (id_ticket, emisor, nombre, mensaje, id_usuario) => {
  let campos = {
    id_asesor: null,
    id_afiliado: null,
    id_administrador: null,
    respuesta: mensaje
  };

  if (emisor === 'afiliado') campos.id_afiliado = id_usuario;
  if (emisor === 'asesor') campos.id_asesor = id_usuario;
  if (emisor === 'admin') campos.id_administrador = id_usuario;

  const result = await pool.query(
    `INSERT INTO respuesta 
     (id_ticket, fecha_respuesta, respuesta, id_asesor, id_afiliado, id_administrador, created_at) 
     VALUES ($1, NOW(), $2, $3, $4, $5, NOW()) RETURNING *`,
    [id_ticket, campos.respuesta, campos.id_asesor, campos.id_afiliado, campos.id_administrador]
  );
  return result.rows[0];
};

// Obtener mensajes por ticket
const obtenerMensajesPorTicket = async (id_ticket) => {
  const result = await pool.query(
    `SELECT id_respuesta, id_ticket, fecha_respuesta, respuesta, 
            id_asesor, id_afiliado, id_administrador
     FROM respuesta 
     WHERE id_ticket = $1
     ORDER BY fecha_respuesta ASC`,
    [id_ticket]
  );
  return result.rows;
};

module.exports = {
  guardarMensaje,
  obtenerMensajesPorTicket
};

module.exports = {
  crearTicket,
  obtenerTicketsPorAfiliado,
  guardarMensaje,
  obtenerMensajesPorTicket
};
