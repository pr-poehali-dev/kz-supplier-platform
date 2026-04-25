CREATE TABLE IF NOT EXISTS t_p6351432_kz_supplier_platform.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p6351432_kz_supplier_platform.sessions (
    token VARCHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p6351432_kz_supplier_platform.companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    category VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(64),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE t_p6351432_kz_supplier_platform.products
    ADD COLUMN IF NOT EXISTS user_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_products_user_id ON t_p6351432_kz_supplier_platform.products(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON t_p6351432_kz_supplier_platform.sessions(user_id);