//routes/ticketsRoutes
const express = require('express');
const router = express.Router();
const { crearTicketAfiliado, listarTicketsAfiliado, enviarMensaje, listarMensajes  } = require('../controllers/ticketController');
const verificarToken = require('../models/authMiddleware');

router.post('/dashboardAfiliado', verificarToken, crearTicketAfiliado );
router.get('/ticketsAfiliado', verificarToken, listarTicketsAfiliado);
router.get('/:id_ticket', verificarToken, listarMensajes);
router.post('/:id_ticket/mensaje', verificarToken, enviarMensaje);


module.exports = router;