const express = require('express');
const router = express.Router();
const pool = require('../models/DbConexion'); // ajusta la ruta según tu estructura

async function registrarLog(idAfiliado, idAsesor, userInput, matchedFaq, chatbotResponse) {
    try {
        await pool.query(
            'INSERT INTO chatbot_log (id_afiliado, id_asesor, user_input, matched_faq, chatbot_response) VALUES ($1, $2, $3, $4, $5)',
            [idAfiliado, idAsesor, userInput, matchedFaq, chatbotResponse]
        );
    } catch (logError) {
        console.error("Error al registrar en chatbot_log:", logError);
    }
}
router.post('/', async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const userInput = req.body.queryResult.queryText;
    let chatbotResponse = ""; // Variable para almacenar la respuesta del chatbot
    let matchedFaq = null; // Para registrar si se encontró una respuesta en la FAQ
    let idAfiliado = null;

    if (intentName === 'VolverMenu') {
        chatbotResponse = "¡Bienvenido nuevamente al menú principal! Por favor, selecciona una opción:\n1. Consultar saldo\n2. Consultar pagos\n3. Preguntas frecuentes (FAQ)\n4. Hablar con un asesor";
        try {
            await registrarLog(idAfiliado, idAsesor, userInput, matchedFaq, chatbotResponse);
        } catch (error) {
            console.error("Error al registrar log en VolverMenu:", error);
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

            await registrarLog(idAfiliado, idAsesor, userInput, matchedFaq, chatbotResponse);
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
            await registrarLog(idAfiliado, idAsesor, userInput, matchedFaq, chatbotResponse);

        }
    }


  if (intentName === 'ConsultaFAQ') {
    const parameters = req.body.queryResult.parameters;
    const tipoCredito = parameters.TipoCredito;
    const tipoServicio = parameters.TipoServicio;
    const tipoSeguro = parameters.TipoSeguro;
    const tipoAsesoria = parameters.TipoAsesoria;
    const userInput = req.body.queryResult.queryText;

    console.log("Parámetros FAQ recibidos:", {
        tipoCredito,
        tipoServicio,
        tipoSeguro,
        tipoAsesoria
    });

    const categoria = tipoCredito || tipoServicio || tipoSeguro || tipoAsesoria;

    function calcularSimilitud(a, b) {
        a = a.toLowerCase().split(/\s+/);
        b = b.toLowerCase().split(/\s+/);
        const interseccion = a.filter(palabra => b.includes(palabra));
        return interseccion.length / Math.max(a.length, b.length);
    }

    try {
        if (!categoria) {
            chatbotResponse = "Lo siento, no entendí bien tu pregunta. ¿Puedes especificar mejor qué necesitas saber?";
        } else {
            const resultado = await pool.query(
                `SELECT pregunta, respuesta FROM faq WHERE categoria ILIKE $1`,
                [categoria]
            );

            if (resultado.rows.length > 0) {
                let maxSimilitud = 0;
                let mejorRespuesta = "No encontré una respuesta específica para tu pregunta.";
                let matchedPregunta = "";

                for (const row of resultado.rows) {
                    const similitud = calcularSimilitud(userInput, row.pregunta);
                    if (similitud > maxSimilitud) {
                        maxSimilitud = similitud;
                        mejorRespuesta = row.respuesta;
                        matchedPregunta = row.pregunta;
                    }
                }

                // Umbral opcional para evitar respuestas irrelevantes
                if (maxSimilitud >= 0.3) {
                    chatbotResponse = mejorRespuesta;
                    matchedFaq = categoria;
                } else {
                    chatbotResponse = `Aquí tienes información general sobre ${categoria.toLowerCase()}: ${resultado.rows[0].respuesta}`;
                    matchedFaq = categoria;
                }

            } else {
                chatbotResponse = `No encontré información relacionada con ${categoria.toLowerCase()}.`;
            }
        }

        return res.json({ fulfillmentText: chatbotResponse });

    } catch (error) {
        console.error("Error en ConsultaFAQ:", error);
        return res.json({ fulfillmentText: "Ocurrió un error al buscar tu respuesta frecuente." });
    } finally {
        await registrarLog(idAfiliado, idAsesor, userInput, matchedFaq, chatbotResponse);
    }
}

});

module.exports = router;