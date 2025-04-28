// auth.js
const bcrypt = require('bcrypt');
const client = require('./DbConexion');
const jwt = require('jsonwebtoken');

const registerUser = async (nombre, cedula, correo, password, rol) => {
    let table = '';
    if (rol === 'afiliado') {
        table = 'afiliado';
    } else if (rol === 'asesor') {
        table = 'asesor';
    } else {
        throw new Error('Rol no válido');
    }

    // Verificar si ya existe correo o cédula
    const res = await client.query(`SELECT * FROM ${table} WHERE correo = $1 OR cedula = $2`, [correo, cedula]);
    if (res.rows.length > 0) {
        throw new Error('Correo o cédula ya registrados');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en la tabla correspondiente
    const result = await client.query(
        `INSERT INTO ${table} (nombre, cedula, correo, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`,
        [nombre, cedula, correo, hashedPassword]
    );

    return result.rows[0];
};

const loginUser = async (email, password) => {
    // Intentar buscar en ambas tablas
    let user = null;
    let table = '';

    const resAfiliado = await client.query('SELECT * FROM afiliado WHERE correo = $1', [email]);
    if (resAfiliado.rows.length > 0) {
        user = resAfiliado.rows[0];
        table = 'afiliado';
    } else {
        const resAsesor = await client.query('SELECT * FROM asesor WHERE correo = $1', [email]);
        if (resAsesor.rows.length > 0) {
            user = resAsesor.rows[0];
            table = 'asesor';
        }
    }

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign({ id: user.id, correo: user.correo, tipo: table }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { token };
};

module.exports = { registerUser, loginUser };
