CREATE TABLE IF NOT EXISTS t_p6351432_kz_supplier_platform.products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'RUB',
    moq INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    image_url TEXT,
    supplier VARCHAR(255),
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON t_p6351432_kz_supplier_platform.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON t_p6351432_kz_supplier_platform.products(created_at DESC);