const express = require('express');
const router = express.Router();
const pool = require('../models/DbConexion'); // ajusta la ruta según tu estructura

router.post('/', async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const userInput = req.body.queryResult.queryText;
    let chatbotResponse = ""; // Variable para almacenar la respuesta del chatbot
    let idAfiliado = null;
    let matchedFaq = null; // Para registrar si se encontró una respuesta en la FAQ

    if (intentName === 'VolverMenu') {
        chatbotResponse = "¡Bienvenido nuevamente al menú principal! Por favor, selecciona una opción:\n1. Consultar saldo\n2. Consultar pagos\n3. Preguntas frecuentes (FAQ)\n4. Hablar con un asesor";

        try {
            await pool.query(
                'INSERT INTO chatbot_log (user_input, chatbot_response) VALUES ($1, $2)',
                [userInput, chatbotResponse]
            );
        } catch (logError) {
            console.error("Error al registrar en chatbot_log:", logError);
        }

        return res.json({ fulfillmentText: chatbotResponse });
    }


    if (intentName === 'ConsultaSaldo') {
        const cedula = req.body.queryResult.parameters.cedula;
        if (!cedula) {
            chatbotResponse = "Por favor, indícame tu número de cédula para consultar tu saldo.";
            return res.json({ fulfillmentText: chatbotResponse });
        }

        try {
            // Consulta al afiliado
            const afiliado = await pool.query('SELECT id_afiliado FROM afiliado WHERE cedula = $1', [cedula]);

            if (afiliado.rows.length === 0) {
                chatbotResponse = "No encontré un afiliado con esa cédula.";
                // No hay id_afiliado para registrar
            } else {
                idAfiliado = afiliado.rows[0].id_afiliado;

                // Consulta el crédito
                const credito = await pool.query(
                    'SELECT monto FROM credito WHERE id_afiliado = $1 ORDER BY created_at DESC LIMIT 1',
                    [idAfiliado]
                );

                if (credito.rows.length === 0) {
                    chatbotResponse = "No hay créditos registrados para este afiliado.";
                } else {
                    const monto = credito.rows[0].monto;
                    chatbotResponse = `Tu saldo actual es de $${monto.toLocaleString('es-CO')} COP.`;
                }
            }

            return res.json({ fulfillmentText: chatbotResponse });

        } catch (error) {
            console.error("Error en webhook (ConsultaSaldo):", error);
            chatbotResponse = "Hubo un error al consultar tu saldo.";
            return res.json({ fulfillmentText: chatbotResponse });
        } finally {
            // Registrar en chatbot_log
            try {
                await pool.query(
                    'INSERT INTO chatbot_log (id_afiliado, user_input, chatbot_response) VALUES ($1, $2, $3)',
                    [idAfiliado, userInput, chatbotResponse]
                );
            } catch (logError) {
                console.error("Error al registrar en chatbot_log:", logError);
            }
        }
    }

    if (intentName === 'ConsultaPagos') {
        const cedula = req.body.queryResult.parameters.cedula;

        if (!cedula) {
            chatbotResponse = "¿Podrías indicarme tu número de cédula para buscar tus pagos?";
            return res.json({ fulfillmentText: chatbotResponse });
        }

        try {
            const afiliado = await pool.query('SELECT id_afiliado FROM afiliado WHERE cedula = $1', [cedula]);

            if (afiliado.rows.length === 0) {
                chatbotResponse = "No encontré un afiliado con esa cédula.";
            } else {
                idAfiliado = afiliado.rows[0].id_afiliado;

                const pagos = await pool.query(
                    `SELECT p.monto, p.fecha_pago
                 FROM pago p
                 JOIN credito c ON p.id_credito = c.id_credito
                 WHERE c.id_afiliado = $1
                 ORDER BY p.fecha_pago DESC
                 LIMIT 5`,
                    [idAfiliado]
                );

                if (pagos.rows.length === 0) {
                    chatbotResponse = "No encontré pagos registrados para este afiliado.";
                } else {
                    let respuesta = "Últimos pagos realizados:\n";
                    pagos.rows.forEach(p => {
                        const fecha = new Date(p.fecha_pago).toLocaleDateString('es-CO');
                        const monto = Number(p.monto).toLocaleString('es-CO');
                        respuesta += `• $${monto} COP el ${fecha}\n`;
                    });
                    chatbotResponse = respuesta.trim();
                }
            }

            return res.json({ fulfillmentText: chatbotResponse });

        } catch (error) {
            console.error("Error en ConsultaPagos:", error);
            chatbotResponse = "Hubo un error al consultar tus pagos.";
            return res.json({ fulfillmentText: chatbotResponse });
        } finally {
            // Registrar en chatbot_log
            try {
                await pool.query(
                    'INSERT INTO chatbot_log (id_afiliado, user_input, chatbot_response) VALUES ($1, $2, $3)',
                    [idAfiliado, userInput, chatbotResponse]
                );
            } catch (logError) {
                console.error("Error al registrar en chatbot_log:", logError);
            }
        }
    }


   if (intentName === 'FAQ') {
    const tipoCredito = parameters.TipoCredito;
    const tipoServicio = parameters.TipoServicio;
    const tipoSeguro = parameters.TipoSeguro;
    const tipoAsesoria = parameters.TipoAsesoria;

    // Determinar la categoría con base en el parámetro recibido
    const categoria =
        tipoCredito || tipoServicio || tipoSeguro || tipoAsesoria;

    let chatbotResponse = '';
    try {
        const resultado = await pool.query(
            `SELECT respuesta 
             FROM faq 
             WHERE categoria ILIKE $1 
             ORDER BY fecha_creacion DESC 
             LIMIT 1`,
            [categoria]
        );

        if (resultado.rows.length > 0) {
            chatbotResponse = resultado.rows[0].respuesta;
        } else {
            chatbotResponse = "No encontré una respuesta para esa categoría. ¿Puedes ser más específico?";
        }

        return res.json({ fulfillmentText: chatbotResponse });

    } catch (error) {
        console.error("Error en FAQ:", error);
        return res.json({ fulfillmentText: "Ocurrió un error al buscar tu respuesta frecuente." });
    }
}

});

module.exports = router;