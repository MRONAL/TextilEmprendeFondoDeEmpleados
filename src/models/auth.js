const bcrypt = require('bcrypt');
const client = require('./DbConexion');
const jwt = require('jsonwebtoken');

const registerUser = async (nombre, cedula, correo, password, rol) => {
    let table = '';
    if (rol === 'afiliado') {
        table = 'afiliado';
    } else if (rol === 'asesor') {
        table = 'asesor';
    } else if (rol === 'administrador') {
        table = 'administrador';
    } else {
        throw new Error('Rol no válido');
    }

    const res = await client.query(
        `SELECT * FROM ${table} WHERE correo = $1 OR cedula = $2`,
        [correo, cedula]
    );

    if (res.rows.length > 0) {
        throw new Error('Correo o cédula ya registrados');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
        `INSERT INTO ${table} (nombre, cedula, correo, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`,
        [nombre, cedula, correo, hashedPassword]
    );

    return result.rows[0];
};

const loginUser = async (email, password) => {
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
        } else {
            const resAdmin = await client.query('SELECT * FROM administrador WHERE correo = $1', [email]);
            if (resAdmin.rows.length > 0) {
                user = resAdmin.rows[0];
                table = 'administrador';
            }
        }
    }

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        throw new Error('Contraseña incorrecta');
    }

    const userId = user.id_afiliado || user.id_asesor || user.id_administrador;

    const token = jwt.sign({ id: userId, correo: user.correo, tipo: table }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { token };
};

module.exports = { registerUser, loginUser };
