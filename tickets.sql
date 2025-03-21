-- 1. Crear la base de datos (opcional, solo si necesitas crearla)
-- CREATE DATABASE tickets;

-- 2. Conectarse a la base
-- \c tickets;

------------------------------------------------------------------------------
-- Tabla: afiliado
------------------------------------------------------------------------------
CREATE TABLE afiliado (
    id_afiliado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,

    -- Auditoria para saber quién creó y actualizó el registro
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT
);

------------------------------------------------------------------------------
-- Tabla: asesor
------------------------------------------------------------------------------
CREATE TABLE asesor (
    id_asesor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,

    -- Auditoria para saber quién creó y actualizó el registro
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT
);

------------------------------------------------------------------------------
-- Tabla: ticket
------------------------------------------------------------------------------
CREATE TABLE ticket (
    id_ticket SERIAL PRIMARY KEY,
    id_afiliado INT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    estado VARCHAR(50) NOT NULL,

    CONSTRAINT fk_ticket_afiliado
        FOREIGN KEY (id_afiliado)
        REFERENCES afiliado (id_afiliado)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Auditoria para saber quién creó y actualizó el registro
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT
);

------------------------------------------------------------------------------
-- Tabla: respuesta
------------------------------------------------------------------------------
CREATE TABLE respuesta (
    id_respuesta SERIAL PRIMARY KEY,
    id_ticket INT NOT NULL,
    fecha_respuesta TIMESTAMP NOT NULL,
    respuesta TEXT NOT NULL,
    id_asesor INT,
    id_afiliado INT,

    CONSTRAINT fk_respuesta_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES ticket (id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_respuesta_asesor
        FOREIGN KEY (id_asesor)
        REFERENCES asesor (id_asesor)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_respuesta_afiliado
        FOREIGN KEY (id_afiliado)
        REFERENCES afiliado (id_afiliado)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    -- Check constraint: al menos uno de los dos (id_asesor o id_afiliado) no sea nulo
    CONSTRAINT chk_respuesta_autor
        CHECK (id_asesor IS NOT NULL OR id_afiliado IS NOT NULL),

    -- Auditoria para saber quién creó y actualizó el registro
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT
);

------------------------------------------------------------------------------
-- Tabla: credito
------------------------------------------------------------------------------
CREATE TABLE credito (
    id_credito SERIAL PRIMARY KEY,
    id_afiliado INT NOT NULL,
    monto DECIMAL(12, 2) NOT NULL,
    interes DECIMAL(5, 2) NOT NULL,
    plazo INT NOT NULL,
    fecha_solicitud TIMESTAMP NOT NULL,

    CONSTRAINT fk_credito_afiliado
        FOREIGN KEY (id_afiliado)
        REFERENCES afiliado (id_afiliado)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Auditoria para saber quién creó y actualizó el registro
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT
);

------------------------------------------------------------------------------
-- Tabla: pago
------------------------------------------------------------------------------
CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY,
    id_credito INT NOT NULL,
    monto DECIMAL(12, 2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL,
    estado VARCHAR(50) NOT NULL,

    CONSTRAINT fk_pago_credito
        FOREIGN KEY (id_credito)
        REFERENCES credito (id_credito)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Auditoria para saber quién creó y actualizó el registro
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT
);

------------------------------------------------------------------------------
-- Tabla: notificacion
-- Para notificar a afiliados/asesores sobre eventos (e.g., ticket creado, cambio de estado)
------------------------------------------------------------------------------
CREATE TABLE notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    id_ticket INT NOT NULL,
    id_afiliado INT,
    id_asesor INT,
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT now(),
    estado VARCHAR(20) DEFAULT 'PENDIENTE',

    -- Integridad referencial con ticket
    CONSTRAINT fk_notif_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES ticket (id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Opcionalmente, podríamos referenciar afiliado y/o asesor si deseamos
    CONSTRAINT fk_notif_afiliado
        FOREIGN KEY (id_afiliado)
        REFERENCES afiliado (id_afiliado)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_notif_asesor
        FOREIGN KEY (id_asesor)
        REFERENCES asesor (id_asesor)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    -- Check constraint: al menos uno (afiliado o asesor) debe existir
    CONSTRAINT chk_notif_autor
        CHECK (id_afiliado IS NOT NULL OR id_asesor IS NOT NULL)
);

------------------------------------------------------------------------------
-- Tabla: faq
-- Para almacenar preguntas frecuentes y sus respuestas (base de conocimiento)
------------------------------------------------------------------------------
CREATE TABLE faq (
    id_faq SERIAL PRIMARY KEY,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    categoria VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT now(),

    -- Campos de auditoría
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT
);

------------------------------------------------------------------------------
-- Tabla: chatbot_log
-- Para registrar las interacciones del chatbot (entrenamiento, análisis, etc.)
------------------------------------------------------------------------------
CREATE TABLE chatbot_log (
    id_log SERIAL PRIMARY KEY,
    id_afiliado INT,
    user_input TEXT NOT NULL,
    matched_faq INT,              -- Referencia a la FAQ que se usó para responder (opcional)
    chatbot_response TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    -- Integridad referencial
    CONSTRAINT fk_log_afiliado
        FOREIGN KEY (id_afiliado)
        REFERENCES afiliado (id_afiliado)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_log_faq
        FOREIGN KEY (matched_faq)
        REFERENCES faq (id_faq)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    -- Check constraint: al menos uno (afiliado o asesor) debe existir
    CONSTRAINT chk_log_autor
        CHECK (id_afiliado IS NOT NULL OR id_asesor IS NOT NULL)
);

-- Mensaje opcional para verificar
SELECT 'Estructura de tablas creada correctamente' AS mensaje;
