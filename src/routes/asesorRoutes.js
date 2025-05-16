//routes/asesorRoutes
const express = require('express');
const router = express.Router();
const { listarTicketsAfiliado, actualizarTicket } = require('../controllers/asesorController');
const verificarToken = require('../models/authMiddleware');

router.get('/infosolicitudes', verificarToken, listarTicketsAfiliado);
router.put('/modificar/tickets/:id', verificarToken, actualizarTicket);


module.exports = router;