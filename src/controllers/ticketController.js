// controllers/ticketController.js
const { crearTicket, obtenerTicketsPorAfiliado, guardarMensaje, obtenerMensajesPorTicket  } = require('../models/tickets');

const crearTicketAfiliado = async (req, res) => {
console.log("Usuario en token:", req.user);
  const { categoria, descripcion } = req.body;
  const usuario_id = req.user.id_afiliado; // <- lo sacamos del token

  try {
    const ticket = await crearTicket(usuario_id, categoria, descripcion);
    console.log("Ticket creado:", ticket);
    res.status(201).json({ message: 'Ticket creado correctamente', ticket });
  } catch (error) {
  console.error("Error al crear el ticket:", error);
    res.status(500).json({ error: 'Error al crear el ticket' });
  }
};

const listarTicketsAfiliado = async (req, res) => {
  const usuario_id = req.user.id_afiliado;

  try {
    const tickets = await obtenerTicketsPorAfiliado(usuario_id);
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'No se pudieron obtener los tickets' });
  }
};

const enviarMensaje = async (req, res) => {
  const { id_ticket, mensaje } = req.body;
  const usuario = req.user;

  let emisor = '';
  let id_usuario = null;

  if (usuario.rol === 'afiliado') {
    emisor = 'afiliado';
    id_usuario = usuario.id_afiliado;
  } else if (usuario.rol === 'asesor') {
    emisor = 'asesor';
    id_usuario = usuario.id_asesor;
  } else if (usuario.rol === 'admin') {
    emisor = 'admin';
    id_usuario = usuario.id_administrador;
  } else {
    return res.status(400).json({ error: 'Rol no reconocido para enviar mensajes' });
  }

  try {
    const nuevoMensaje = await guardarMensaje(id_ticket, emisor, usuario.nombre, mensaje, id_usuario);
    res.status(201).json(nuevoMensaje);
  } catch (error) {
    console.error('Error al guardar el mensaje:', error);
    res.status(500).json({ error: 'No se pudo guardar el mensaje' });
  }
};

const listarMensajes = async (req, res) => {
  const id_ticket = req.params.id_ticket;

  try {
    const mensajes = await obtenerMensajesPorTicket(id_ticket);
    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'No se pudieron obtener los mensajes' });
  }
};

module.exports = { crearTicketAfiliado, listarTicketsAfiliado, enviarMensaje,
listarMensajes };

