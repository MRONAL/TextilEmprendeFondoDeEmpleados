// controllers/adminController.js
const { obtenerClientes, obtenerAsesores, actualizarTicket, obtenerTickets } = require('../models/admin');

const obtenerUsuarios = async (req, res) => {
  try {
    const clientes = await obtenerClientes();
    const asesores = await obtenerAsesores();

    res.json({ clientes, asesores });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};
// Obtener todas las solicitudes (tickets)
const obtenerSolicitudes = async (req, res) => {
  try {
    const tickets = await obtenerTickets();
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'No se pudieron obtener los tickets' });
  }
};

// Actualizar una solicitud (ticket)
const actualizarSolicitud = async (req, res) => {
  const { id_ticket } = req.params;
  const { estado, descripcion, id_asesor, prioridad, id_administrador} = req.body;

  try {
    const actualizado = await actualizarTicket(id_ticket, estado, descripcion, id_asesor, prioridad, id_administrador);
    if (!actualizado) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    res.json({ message: 'Ticket actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({ error: 'No se pudo actualizar el ticket' });
  }
};


module.exports = {
  obtenerUsuarios, obtenerSolicitudes, actualizarSolicitud
};
