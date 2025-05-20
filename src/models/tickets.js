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

// Obtener mensajes por ticket con nombres de remitentes
const obtenerMensajesPorTicket = async (id_ticket) => {
  const result = await pool.query(
    `SELECT r.id_respuesta, r.id_ticket, r.fecha_respuesta, r.respuesta, 
            r.id_asesor, r.id_afiliado, r.id_administrador,
            a.nombre AS nombre_afiliado,
            s.nombre AS nombre_asesor,
            ad.nombre AS nombre_administrador
     FROM respuesta r
     LEFT JOIN afiliado a ON r.id_afiliado = a.id_afiliado
     LEFT JOIN asesor s ON r.id_asesor = s.id_asesor
     LEFT JOIN administrador ad ON r.id_administrador = ad.id_administrador
     WHERE r.id_ticket = $1
     ORDER BY r.fecha_respuesta ASC`,
    [id_ticket]
  );
  return result.rows;
};



// Obtener información de ticket con nombre del asesor
const obtenerDetallesTicket = async (id_ticket) => {
  const result = await pool.query(
    `SELECT 
        t.id_ticket,
        t.categoria,
        t.estado,
        t.descripcion,
        t.fecha_creacion,
        t.id_asesor,
        a.nombre AS nombre_asesor
     FROM ticket t
     LEFT JOIN asesor a ON t.id_asesor = a.id_asesor
     WHERE t.id_ticket = $1`,
    [id_ticket]
  );

  return result.rows[0];
};

// Obtener estadísticas de tickets por estado (para gráfico)
const obtenerEstadisticasPorEstado = async () => {
  const result = await pool.query(`
    SELECT estado, COUNT(*) AS total
    FROM ticket
    GROUP BY estado
  `);
  return result.rows;
};


module.exports = {
  crearTicket,
  obtenerTicketsPorAfiliado,
  guardarMensaje,
  obtenerMensajesPorTicket,
  obtenerDetallesTicket,
  obtenerEstadisticasPorEstado
};





