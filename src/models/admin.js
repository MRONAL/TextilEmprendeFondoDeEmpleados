// models/admin.js

const pool = require('./DbConexion'); // tu conexión a PostgreSQL

// Obtener todos los afiliados (clientes)
const obtenerClientes = async () => {
  const result = await pool.query(
    'SELECT id_afiliado AS id, nombre, cedula, correo FROM afiliado'
  );
  return result.rows;
};

// Obtener todos los asesores
const obtenerAsesores = async () => {
  const result = await pool.query(
    'SELECT id_asesor AS id, nombre, cedula, correo FROM asesor'
  );
  return result.rows;
};

// Obtener todos los tickets con datos del afiliado y asesor
const obtenerTickets = async () => {
  const result = await pool.query(`
SELECT 
  t.id_ticket,
  a.nombre AS nombre_afiliado,
  t.categoria,
  t.estado,
  t.prioridad,
  t.descripcion,
  t.fecha_creacion,
  t.updated_at,
  s.nombre AS nombre_asesor
FROM ticket t
JOIN afiliado a ON t.id_afiliado = a.id_afiliado
LEFT JOIN asesor s ON t.id_asesor = s.id_asesor
ORDER BY t.fecha_creacion DESC;

  `);
  return result.rows;
};

// Actualizar un ticket (estado, descripción, prioridad, asesor) y guardar respuesta
const actualizarTicket = async (idTicket, estado, descripcion, id_asesor, prioridad, respuesta, id_administrador) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Actualizar el ticket
    const result = await client.query(
      `UPDATE ticket
       SET estado = $1,
           descripcion = $2,
           id_asesor = $3,
           prioridad = $4,
           updated_at = NOW()
       WHERE id_ticket = $5
       RETURNING id_afiliado`,
      [estado, descripcion, id_asesor, prioridad, idTicket]
    );

    // Si no se actualizó ningún ticket, cancelar operación
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    const id_afiliado = result.rows[0].id_afiliado;

    // Insertar respuesta del administrador si existe contenido
    if (respuesta && respuesta.trim() !== '') {
      await client.query(
        `INSERT INTO respuesta (id_ticket, fecha_respuesta, respuesta, id_asesor, id_afiliado, id_administrador)
         VALUES ($1, NOW(), $2, $3, $4, $5)`,
        [idTicket, respuesta, id_asesor, id_afiliado, id_administrador]
      );
    }

    await client.query('COMMIT');
    return true;

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar ticket o guardar respuesta:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  obtenerClientes,
  obtenerAsesores,
  obtenerTickets,
  actualizarTicket,
};
