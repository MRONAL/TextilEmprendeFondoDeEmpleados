//controllers/asesorController.js
const { obtenerTicketsPorAsesor, actualizarTicketPorAsesor } = require('../models/asesor');

const listarTicketsAfiliado = async (req, res) => {
  const usuario_id = req.user.id_asesor;

  try {
    const tickets = await obtenerTicketsPorAsesor(usuario_id);
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'No se pudieron obtener los tickets' });
  }
};

const actualizarTicket = async (req, res) => {
  const id_asesor = req.user.id_asesor;
  const { id_ticket } = req.params;
  const { estado, descripcion } = req.body;

  try {
    const actualizado = await actualizarTicketPorAsesor(id_ticket, id_asesor, estado, descripcion);
    if (!actualizado) {
      return res.status(404).json({ error: 'Ticket no encontrado o no autorizado' });
    }
    res.json({ message: 'Ticket actualizado correctamente' });
  } catch (error) {
    console.error('Error al modificar ticket:', error);
    res.status(500).json({ error: 'Error al modificar el ticket' });
  }
};



module.exports = { listarTicketsAfiliado, actualizarTicket };