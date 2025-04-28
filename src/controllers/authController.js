const { registerUser, loginUser } = require('../models/auth');

const register = async (req, res) => {
    const { nombre, cedula, correo, password, rol } = req.body;
    try {
        const newUser = await registerUser(nombre, cedula, correo, password, rol);
        res.status(201).json({ message: 'Usuario registrado correctamente', user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token } = await loginUser(email, password);
        res.status(200).json({ message: 'Login exitoso', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { register, login };
