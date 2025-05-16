const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketsRoutes');
const asesor = require('./routes/asesorRoutes');
const adminRoutes = require('./routes/adminRoutes');


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rutas
app.use("/api", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/asesor", asesor);
app.use("/api/admin", adminRoutes)

// Rutas para servir vistas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'singup.html'));
});

app.get('/dashboardAfiliado', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboardAfiliado.html'));
});

app.get('/dashboardAsesor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboardAsesor.html'));
});
app.get('/dashboardAdmin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboardAdmin.html'));
});


app.get('/dashboardAdministrador', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboardAdministrador.html'));
});

app.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chatbot.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
