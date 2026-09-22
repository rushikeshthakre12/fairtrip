-- FairTrip PostgreSQL schema
-- Run automatically by docker-compose (mounted into /docker-entrypoint-initdb.d)
-- or manually via: psql -U fairtrip -d fairtrip -f schema.sql

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,      -- e.g. 'Taxi', 'Auto'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Raw community submissions. NOT trusted until validated.
CREATE TABLE IF NOT EXISTS price_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    city VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL CHECK (distance_km > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price > 0),
    trip_date DATE NOT NULL,
    trip_time TIME NOT NULL,
    vehicle_type VARCHAR(50),
    notes TEXT,
    evidence_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'VALIDATED', 'REJECTED')),
    rejection_reason TEXT,
    validated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Denormalized, training-ready view of only validated reports.
-- Populated/refreshed by the validation service when a report is approved.
CREATE TABLE IF NOT EXISTS validated_prices (
    id SERIAL PRIMARY KEY,
    price_report_id INTEGER UNIQUE REFERENCES price_reports(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    hour SMALLINT NOT NULL,
    day_of_week SMALLINT NOT NULL,
    month SMALLINT NOT NULL,
    vehicle_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Every prediction served, for audit / future confidence scoring.
CREATE TABLE IF NOT EXISTS analysis_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    city VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL,
    quoted_price NUMERIC(10,2) NOT NULL,
    predicted_price NUMERIC(10,2) NOT NULL,
    range_min NUMERIC(10,2) NOT NULL,
    range_max NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    confidence VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Raw OCR extraction attempts (Scan & Check feature).
CREATE TABLE IF NOT EXISTS ocr_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    image_url TEXT,
    raw_text TEXT,
    extracted_service VARCHAR(50),
    extracted_price NUMERIC(10,2),
    confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_reports_status ON price_reports(status);
CREATE INDEX IF NOT EXISTS idx_price_reports_city_service ON price_reports(city, service_type);
CREATE INDEX IF NOT EXISTS idx_validated_city_service ON validated_prices(city, service_type);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created ON analysis_history(created_at);

-- Seed reference data
INSERT INTO cities (name, state) VALUES
    ('Mumbai', 'Maharashtra'),
    ('Nagpur', 'Maharashtra'),
    ('Delhi', 'Delhi'),
    ('Bengaluru', 'Karnataka'),
    ('Pune', 'Maharashtra'),
    ('Jaipur', 'Rajasthan'),
    ('Goa', 'Goa')
ON CONFLICT (name) DO NOTHING;

INSERT INTO services (name) VALUES ('Taxi'), ('Auto')
ON CONFLICT (name) DO NOTHING;
