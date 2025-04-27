const bcrypt = require('bcrypt');
const client = require('./DbConexion');
const jwt = require('jsonwebtoken');


const registerAfiliado = async (nombre, cedula, correo, password) => {
    const res = await client.query('SELECT * FROM afiliado WHERE correo = $1 OR cedula = $2', [correo, cedula]);
    if (res.rows.length > 0) {
        throw new Error('Correo o cédula ya registrados');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await client.query(
        'INSERT INTO afiliado (nombre, cedula, correo, password_hash) VALUES ($1, $2, $3, $4) RETURNING id_afiliado, nombre, correo',
        [nombre, cedula, correo, hashedPassword]
    );

    return result.rows[0];
};

const loginUser = async (email, password) => {
    const res = await client.query('SELECT * FROM afiliado WHERE correo = $1', [email]);
    if (res.rows.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    const user = res.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token };
};

module.exports = { registerAfiliado, loginUser };
