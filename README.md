# LabaikMobiles

Premium e-commerce platform for mobile phones and accessories.

**Brand:** LabaikMobiles  
**Currency:** PKR  
**Locale:** English  
**Commerce model:** Catalog + contact-to-order (no online checkout / payments in MVP)

## Monorepo

```
apps/web   → React + Vite + TypeScript (Vercel)
apps/api   → FastAPI + SQLAlchemy + Alembic (Render)
```

## Prerequisites

- Node.js 20+
- Python 3.12+ (3.14 works for local scaffold)
- Supabase Postgres (or local Postgres) when you reach schema migrations

## Quick start

### API

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### Web

```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

App: [http://127.0.0.1:5173](http://127.0.0.1:5173)

## Deploy (free)

Step-by-step: **[docs/DEPLOY.md](docs/DEPLOY.md)**

Order: **Supabase (DB) → Render (API) → Vercel (web)**.

## Phase status

| Phase | Status |
|-------|--------|
| 1 Architecture | Done |
| 2 Foundation | Done |
| 3 Auth + Admin portal | Done |
| 4 Catalog API + Admin CRUD | Done |
| 5 Polish / deploy / storage uploads | **In progress** (deploy guide ready; Storage uploads later) |

## Product decisions (locked)

- No payment gateway
- No cart checkout — CTA routes to **Contact**
- No SEO/SSR requirement (Vite SPA)
- English only

## Design tokens

- Primary blue `#18A6E5`
- Primary green `#59BC46`
- Neutrals + soft brand washes for a premium tech aesthetic
