const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (si los usas en 'public')
app.use(express.static(path.join(__dirname, 'public')));

// Página de inicio de sesión
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Dashboard del afiliado
app.get('/dashboardAfiliado.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboardAfiliado.html'));
});

// Dashboard del administrador (cuando lo tengas)
app.get('/dashboardAdmin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboardAdmin.html'));
});

// Dashboard de soporte técnico (cuando lo tengas)
app.get('/dashboardSoporte.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboardSoporte.html'));
});

// Rutas de autenticación
app.use('/api', authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
