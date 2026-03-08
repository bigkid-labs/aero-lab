-- Migration: 0001_init
-- Core schema for BIGKID Aero Lab
-- All PKs: UUID v7 (time-sortable). All timestamps: TIMESTAMPTZ.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Products ──────────────────────────────────────────────────────────────────
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    category        TEXT NOT NULL,           -- e.g. 'cockpit', 'saddle', 'frame'
    description     TEXT,
    price_vnd       BIGINT,                  -- price in Vietnamese Dong
    model_key       TEXT,                    -- MinIO object key for .glb file
    thumbnail_key   TEXT,                    -- MinIO object key for .webp
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aero and geometry specs per product
CREATE TABLE product_geometries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    spec_key        TEXT NOT NULL,           -- e.g. 'stack', 'reach', 'drop', 'weight_g'
    spec_value      NUMERIC NOT NULL,
    unit            TEXT NOT NULL,           -- e.g. 'mm', 'g', 'deg'
    UNIQUE (product_id, spec_key)
);

-- ─── Riders ───────────────────────────────────────────────────────────────────
CREATE TABLE riders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       TEXT NOT NULL,
    email           TEXT UNIQUE,
    phone           TEXT,
    torso_mm        NUMERIC,
    arm_mm          NUMERIC,
    inseam_mm       NUMERIC,
    flexibility     SMALLINT CHECK (flexibility BETWEEN 1 AND 5),  -- 1=stiff, 5=flexible
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Consultations ────────────────────────────────────────────────────────────
CREATE TYPE consultation_status AS ENUM ('pending', 'active', 'closed');

CREATE TABLE consultations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id        UUID REFERENCES riders(id) ON DELETE SET NULL,
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    status          consultation_status NOT NULL DEFAULT 'pending',
    message         TEXT,
    telegram_msg_id BIGINT,                  -- Telegram message ID for tracking
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Fit Recommendations ──────────────────────────────────────────────────────
CREATE TABLE fit_recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id        UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    recommendation  TEXT NOT NULL,           -- Human-readable fit summary
    fit_score       NUMERIC(4,2),            -- 0.00–10.00
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_rider ON consultations(rider_id);
CREATE INDEX idx_fit_recommendations_rider ON fit_recommendations(rider_id);
