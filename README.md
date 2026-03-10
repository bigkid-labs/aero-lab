# BIGKID Aero Lab

> **Performance Hub for elite TT/Triathlon cycling in Vietnam.**
> Engineering showcase. Consultative sales. Precision fit.

---

## Overview

BIGKID Aero Lab is a full-stack platform built for serious time-trial and triathlon athletes. It combines an aerodynamics calculator, a precision bike-fitting engine, and a consultative product catalog — all backed by a high-performance Rust API and a 3D-capable Next.js frontend.

This is not a generic e-commerce store. Every product recommendation is earned through data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Rust + Axum |
| Database | PostgreSQL 16 (via `sqlx`) |
| Frontend | Next.js 15 (App Router, React Server Components) |
| 3D Rendering | React Three Fiber + `@react-three/drei` |
| Storage | MinIO (S3-compatible, self-hosted) |
| Sales Alerts | Telegram Bot (`teloxide`) |
| Validation | `zod` (frontend), `thiserror` (backend) |
| i18n | `next-intl` (English + Vietnamese) |

---

## Features

### Aero Calculator
Physics-accurate drag model — computes watts saved and time gained across rider positions at real-world speeds and air densities. Accounts for tropical vs. standard air density and yaw angle correction.

### Bike Fit Engine
Enter rider biometrics (torso, arm, inseam, flexibility, aggression) against any product's geometry spec. Returns a fit score (0–10), risk assessment (Low / Moderate / High), verdict, and precise millimetre-level adjustment recommendations.

### Product Catalog
SSR product listing and detail pages with 3D model viewer (GLTF/GLB via presigned MinIO URLs). Category filtering, geometry spec tables, fit + consult CTAs.

### Consultation Flow
Inquiry form triggers a non-blocking Telegram alert to the sales team with rider name, product of interest, and fit summary.

---

## Project Structure

```
big-kid-aero/
├── apps/
│   ├── api/                  # Rust (Axum) backend
│   │   └── src/
│   │       ├── domains/
│   │       │   ├── products/       # Catalog, aero specs, 3D model refs
│   │       │   ├── fitting/        # Fit scoring engine
│   │       │   ├── consultation/   # Inquiry lifecycle + Telegram alerts
│   │       │   └── storage/        # MinIO presigned URL generation
│   │       ├── config.rs
│   │       ├── error.rs
│   │       ├── router.rs
│   │       └── main.rs
│   └── web/                  # Next.js 15 frontend
│       └── src/
│           ├── app/[locale]/
│           │   ├── page.tsx        # Landing page
│           │   ├── aero/           # Aero calculator
│           │   ├── fitting/        # Fit tool
│           │   ├── products/       # Catalog + detail + compare
│           │   └── consult/        # Consultation form
│           ├── components/
│           │   ├── 3d/             # R3F product viewer
│           │   ├── ui/             # Primitives (Tooltip, ProductCard, etc.)
│           │   └── layout/         # Nav, TelegramFloat
│           └── lib/
│               ├── api.ts          # Typed API client (zod-validated)
│               ├── physicsEngine.ts # Aero drag computation
│               └── fitEngine.ts    # Client-side fit logic
├── docs/
│   └── ARCHITECTURE.md
├── docker-compose.yml
├── Makefile
└── .env.example
```

---

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) (for Postgres + MinIO)

### 1. Clone and configure environment

```bash
git clone https://github.com/your-org/big-kid-aero.git
cd big-kid-aero
cp .env.example .env
# Edit .env with your values (see Environment Variables below)
```

### 2. Start backing services

```bash
make dev
```

This starts PostgreSQL 16 on `:5432` and MinIO on `:9000` (UI on `:9001`).

### 3. Run database migrations

```bash
make migrate
```

### 4. Start the API

```bash
make dev-api
# → BIGKID API listening on 0.0.0.0:8080
```

### 5. Start the frontend

```bash
cd apps/web && npm install
make dev-web
# → http://localhost:3000
```

---

## Makefile Commands

| Command | Description |
|---|---|
| `make dev` | Start Docker services (Postgres + MinIO) |
| `make dev-api` | Run Rust API in development mode |
| `make dev-web` | Run Next.js dev server |
| `make migrate` | Apply pending sqlx migrations |
| `make test` | Run all tests (Rust + Next.js) |
| `make build` | Production builds for API and web |
| `make db-reset` | Wipe DB volumes and re-migrate from scratch |

---

## API Reference

Base URL: `http://localhost:8080`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `GET` | `/api/v1/products` | List all products |
| `GET` | `/api/v1/products/:slug` | Product detail + specs |
| `POST` | `/api/v1/fitting/analyze` | Run fit analysis for a rider + product |
| `POST` | `/api/v1/consultations` | Submit consultation request |
| `GET` | `/api/v1/storage/presigned?key=` | Generate presigned URL for a 3D asset |

### Fit Analysis — Request body

```json
{
  "full_name": "Nguyen Van A",
  "email": "rider@example.com",
  "torso_mm": 580,
  "arm_mm": 620,
  "inseam_mm": 820,
  "flexibility": 3,
  "aggression_level": 4,
  "product_slug": "enve-aero-bar"
}
```

---

## Environment Variables

Copy `.env.example` and fill in your values:

```env
# PostgreSQL
DATABASE_URL=postgres://bigkid:bigkid_dev@localhost:5432/bigkid_aero

# API server
BIND_ADDR=0.0.0.0:8080
RUST_LOG=info

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_dev
MINIO_BUCKET=bigkid-assets

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=-1001234567890

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

To get a Telegram Bot token: talk to [@BotFather](https://t.me/BotFather) on Telegram.

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system design, domain structure, data flow diagram, and architecture decision records (ADRs).

```
[Browser]
   │  SSR / RSC page load
   ▼
[Next.js 15]
   │  REST
   ▼
[Axum API]
   ├──► [PostgreSQL]   structured data
   ├──► [MinIO]        presigned URLs for 3D assets
   └──► [Telegram Bot] sales alerts on new consultations

[Browser]
   │  presigned URL (direct, bypasses API)
   ▼
[MinIO]  3D asset (.glb / .gltf)
```

---

## i18n

The frontend is fully bilingual. Translations live in:

```
apps/web/messages/
├── en.json
└── vi.json
```

Language is switched via the EN / VI toggle in the nav bar. URLs are prefixed: `/en/...` and `/vi/...`.

---

## Engineering Standards

- **No `unwrap()`** in Rust — all errors go through `AppError` + `thiserror`
- **No `unsafe` blocks**
- **TypeScript strict mode** — no `any`
- **Input validation** at all API boundaries (zod on frontend, sqlx types on backend)
- All business logic comments in English
- Lighthouse target: 90+

---

## License

Private — BIGKID Aero Lab. All rights reserved.
