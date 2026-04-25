CREATE TABLE IF NOT EXISTS t_p6351432_kz_supplier_platform.reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    user_id INTEGER,
    author_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON t_p6351432_kz_supplier_platform.reviews(product_id);