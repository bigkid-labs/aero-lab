# BIGKID Aero Lab — Features & Recipe

> Vietnam's exclusive TT & Triathlon performance lab. Precision-engineered for your exact geometry.

---

## Stack at a Glance

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + React |
| Backend | Rust (Axum 0.7) |
| Database | PostgreSQL + sqlx 0.8 |
| Storage | MinIO (S3-compatible) via `object_store` |
| Notifications | Telegram Bot via `teloxide` |
| i18n | next-intl (EN / VI) |
| 3D Viewer | React Three Fiber + Drei |
| Font | Inter (sans) · IBM Plex Mono (mono) · Barlow Condensed (display) |
| Validation | Zod (frontend) · thiserror (backend) |

---

## Pages & Features

### `/` — Homepage
Five full-viewport sections forming the brand narrative:

1. **Hero** — Full-viewport, transparent fixed nav overlay, animated CSS speed lines, `−38W` metric top-right, 3-line display headline, primary + secondary CTA.
2. **Manifesto** — Brand philosophy, ghost "SPEED" background text, three pillar cards (Precision / Performance / Yours Alone).
3. **Numbers** — Three headline metrics: `<1 MM` positional tolerance · `38 W` aero gain · `3 STEPS` from consult to speed.
4. **Process** — Three clickable cards linking to Fit Tool → Products → Consult, with step numbers as decorative backgrounds.
5. **Final CTA** — Radial gradient section, dual CTAs, three trust signals (UCI Legal · Handbuilt · <24h response).

---

### `/products` — Product Catalog
- Fetches all active products from the API (server-side).
- Category filter links (query-string based, no JS required).
- Product grid with `ProductCard` components.
- **Compare feature**: each card has a `CompareButton` — first click stores slug in `localStorage`, second click (different product) navigates to `/products/compare?a=X&b=Y`.

### `/products/[slug]` — Product Detail
- Server-rendered product page with full geometry specs table.
- Integrated **3D model viewer** (`ProductViewer` — React Three Fiber). If no `.glb` model is uploaded, shows a placeholder.
- Two CTAs: "Request Consultation" (links to `/consult?product=slug`) and "Check Fit" (links to `/fitting`).

### `/products/compare` — Side-by-Side Comparison
- Accepts `?a=slug&b=slug` query params.
- Fetches both products in parallel (`Promise.all`).
- Unified spec key table: better value highlighted in orange.
- Per-product CTAs to consult or view the full detail page.

---

### `/fitting` — Fit Tool
- Server renders product list for the dropdown.
- **`FitForm`** (client component) collects:
  - Rider info: name, email (optional)
  - Body geometry (mm): torso · arm (sải tay) · inseam (chân trong)
  - Flexibility rating (1–5 scale)
  - Product selection
- Submits to `POST /api/v1/fitting/analyze`.
- Displays **Fit Score / 10**, verdict, recommendation text, and per-spec adjustment cards (each shows current → ideal → delta mm).
- "Discuss with a Specialist" CTA after result.

**Backend engine formula (TT geometry):**
```
ideal_reach  = arm_mm  × 0.92 + aggression × 10
ideal_stack  = torso_mm × 0.62 − aggression × 25
ideal_drop   = inseam_mm × 0.05 + aggression × 20
```
Score = average of (reach_score · stack_score · drop_score), each scored on proximity to ideal.

---

### `/consult` — Consultation Request
- Server renders product list for optional product interest field.
- **`ConsultForm`** (client component): name · email · phone/Telegram · product interest · goal message.
- Submits to `POST /api/v1/consultations`.
- **Backend flow**: upserts rider record (ON CONFLICT email) → creates consultation → fires non-blocking Telegram alert via `tokio::spawn`.
- Success state replaces form with confirmation message.

---

### `/aero` — Aero Watt Calculator
- **`AeroCalculator`** (client component, no API calls).
- Six CdA position presets (0.38 → 0.17 m²):
  - Upright Road · Road Drops · TT Unoptimised · TT Average · TT Good · TT Elite (BIGKID)
- Two sliders: Average Speed (25–55 km/h) · Race Distance (10–180 km).
- Physics model: `P = 0.5 × ρ × CdA × v³` (ρ = 1.225 kg/m³).
- Live results (via `useMemo`): watts saved · time saved · CdA reduction.
- CdA spectrum bar visualization showing both selected positions.
- Sticky result card. "Unlock These Gains" CTA links to `/consult`.

---

## Shared UI Components

| Component | Location | Purpose |
|---|---|---|
| `Nav` | `components/layout/Nav.tsx` | Fixed, scroll-aware transparency (transparent on hero, opaque after 60px scroll). Logo + nav links + language switcher. |
| `TelegramFloat` | `components/ui/TelegramFloat.tsx` | Fixed bottom-right button, appears after 200px scroll. Expand/collapse tooltip with Telegram deep link. |
| `LanguageSwitcher` | `components/ui/LanguageSwitcher.tsx` | EN / VI toggle in nav. Uses `next-intl` `useRouter.replace` to swap locale while preserving path. |
| `SpeedLines` | `components/ui/SpeedLines.tsx` | Pure CSS server component. 10 animated horizontal lines in the hero. Zero JS. |
| `ProductCard` | `components/ui/ProductCard.tsx` | Product thumbnail, category badge, VND price, compare button. |
| `CompareButton` | `components/ui/CompareButton.tsx` | `localStorage`-based cross-card compare state. No context provider needed. |
| `ProductViewer` | `components/3d/ProductViewer.tsx` | React Three Fiber canvas. Loads `.glb` from presigned MinIO URL. |

---

## Internationalisation (next-intl)

| File | Role |
|---|---|
| `src/proxy.ts` | Middleware: intercepts all non-asset requests, injects locale prefix. |
| `src/i18n/routing.ts` | Defines `locales: ["en", "vi"]`, `defaultLocale: "en"`. |
| `src/i18n/request.ts` | Server: loads `messages/${locale}.json` per request. |
| `src/i18n/navigation.ts` | Exports locale-aware `Link`, `useRouter`, `usePathname`. |
| `messages/en.json` | English copy for all 11 namespaces. |
| `messages/vi.json` | Vietnamese copy — written for Vietnamese cycling community, not literal translation. Technical terms (Fit, Reach, Stack, CdA, UCI) kept in English. |

**Usage pattern:**
- Server components → `getTranslations("namespace")`
- Client components → `useTranslations("namespace")`
- Root layout sets `<html lang={locale}>` via `await getLocale()` from `next-intl/server`.

---

## Backend API (`apps/api`)

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service health check |
| GET | `/api/v1/products` | List active products (optional `?category=`) |
| GET | `/api/v1/products/categories` | Distinct category list |
| GET | `/api/v1/products/:slug` | Product detail with geometries |
| POST | `/api/v1/fitting/analyze` | Run fit engine, return score + adjustments |
| POST | `/api/v1/consultations` | Create consultation, fire Telegram alert |
| GET | `/api/v1/storage/presigned?key=` | 1-hour presigned GET URL for MinIO objects |

### Database Schema (PostgreSQL)

```
products            — id, slug, name, category, price_vnd, model_key, thumbnail_key
product_geometries  — product_id → spec_key, spec_value, unit (e.g. reach/490/mm)
riders              — id, full_name, email (UNIQUE), torso_mm, arm_mm, inseam_mm, flexibility
consultations       — rider_id, product_id, status (pending/active/closed), message
fit_recommendations — rider_id, product_id, fit_score (0–10), recommendation
```
All PKs: UUID v7 (time-sortable). All timestamps: TIMESTAMPTZ.

### Key Architectural Decisions

- **Error handling**: `AppError` enum with `thiserror`, implements `IntoResponse` → JSON `{ "error": "message" }`. No `unwrap()` anywhere.
- **Non-blocking Telegram**: alerts fired via `tokio::spawn` — consultation endpoint returns immediately.
- **MinIO presigned URLs**: uses concrete `Arc<AmazonS3>` (not `dyn ObjectStore`) to access the `Signer` trait without downcast.
- **Rider upsert**: `ON CONFLICT (email) DO UPDATE` — same rider can re-consult without duplicate records.
- **NUMERIC → f64**: spec values use `CAST(spec_value AS FLOAT8)` in SQL queries to avoid sqlx type friction.

---

## Font Stack

| Variable | Font | Subsets | Usage |
|---|---|---|---|
| `--font-sans` | Inter | `latin`, `vietnamese` | Body, paragraphs, descriptions |
| `--font-mono` | IBM Plex Mono | `latin`, `vietnamese` | Labels, badges, monospace UI, nav links |
| `--font-display` | Barlow Condensed 700/800/900 | `latin`, `latin-ext` | All display headlines |

> Geist / Geist Mono were replaced because they only ship with `latin` subset — Vietnamese diacritics (ọ, ắ, ứ, etc.) triggered a mismatched system font fallback, breaking label rendering.

---

## Design System (CSS Variables)

```css
--aero-black:       #05080f   /* page background */
--aero-surface:     #0b1020   /* card/section background */
--aero-surface-2:   #101828   /* elevated surface */
--aero-border:      #1c2a3f   /* borders and dividers */
--aero-accent:      #ff4500   /* performance orange — CTAs, highlights */
--aero-white:       #f5f5f5   /* primary text */
--aero-off-white:   #c8d0dc   /* secondary text */
--aero-grey:        #7a8fa8   /* muted text */
--aero-grey-dim:    #354560   /* disabled / placeholder */
```

Animations: `speedLine` · `fadeUp` · `fadeIn` · `scan` · `pulse` · `blink`

---

## Dev Commands

```bash
# Frontend
cd apps/web
npm install
npm run dev       # http://localhost:3000
npm run build
npm run lint

# Backend
cd apps/api
cargo build
cargo run         # http://localhost:8080
DATABASE_URL=postgres://... cargo sqlx migrate run

# Environment variables (apps/api/.env)
DATABASE_URL=postgres://user:pass@localhost:5432/bigkid
BIND_ADDR=0.0.0.0:8080
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=bigkid-assets
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Frontend env (apps/web/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080
```
