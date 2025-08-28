-- Agregar columnas de verificación a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;

-- Crear tabla para códigos de verificación de email
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Crear tabla para códigos de verificación de teléfono
CREATE TABLE IF NOT EXISTS phone_verification_codes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user_id ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at ON email_verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_user_id ON phone_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_expires_at ON phone_verification_codes(expires_at);





