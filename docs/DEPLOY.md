# Free-tier deploy (Phase 5)

Order matters: **Supabase (database) → Render (API) → Vercel (website)**.

## What you get (all free)

| Piece | Platform | Cost |
|-------|----------|------|
| Website | [Vercel](https://vercel.com) Hobby | Free |
| API | [Render](https://render.com) Free web service | Free (spins down after idle) |
| Database | [Supabase](https://supabase.com) Free Postgres | Free |

> Render free apps sleep after ~15 minutes idle. First request after sleep can take 30–60s.

---

## 1) Supabase — create the database

1. Sign up at https://supabase.com and create a project (region close to Pakistan if available, else Singapore).
2. Open **Project Settings → Database**.
3. Copy the **URI** connection string (use the **Session pooler** or direct URI).
4. It looks like:
   `postgresql://postgres.[ref]:YOUR_PASSWORD@aws-0-....pooler.supabase.com:5432/postgres`
5. Keep this string for Render as `DATABASE_URL`.  
   The API auto-converts it to the `postgresql+psycopg://` form.

Optional later (Phase 5 storage): enable Storage bucket `product-images` — not required to go live.

---

## 2) Render — deploy the API

1. Push this repo to GitHub (`tumer2667/LabaikMobile`).
2. Go to https://dashboard.render.com → **New → Blueprint** (uses `render.yaml`)  
   **or** **New → Web Service** and connect the repo.
3. If manual setup:
   - **Root Directory:** `apps/api`
   - **Build:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health check:** `/api/v1/health`
4. Set environment variables:

| Key | Value |
|-----|--------|
| `APP_ENV` | `production` |
| `DATABASE_URL` | Supabase URI from step 1 |
| `JWT_SECRET_KEY` | long random string (or let Render generate) |
| `CORS_ORIGINS` | `https://YOUR-VERCEL-DOMAIN` (add after Vercel) |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD` | strong password |
| `ADMIN_FULL_NAME` | `Labaik Admin` |
| `PYTHON_VERSION` | `3.12.8` |

5. Deploy. Wait until status is **Live**.
6. Open:
   - Health: `https://YOUR-API.onrender.com/api/v1/health`
   - Docs: `https://YOUR-API.onrender.com/docs`

On first boot the API creates the admin user and seeds demo catalog data.

---

## 3) Vercel — deploy the website

1. Go to https://vercel.com → **Add New → Project** → import `LabaikMobile`.
2. Either:
   - **Root Directory** = `apps/web` (recommended), **or**
   - leave Root `/` — repo `vercel.json` already builds `apps/web`.
3. Framework: **Vite**. Output: `dist` (if Root is `apps/web`).
4. Environment variables (Production):

| Key | Value |
|-----|--------|
| `VITE_APP_NAME` | `LabaikMobiles` |
| `VITE_API_URL` | `https://YOUR-API.onrender.com/api/v1` |
| `VITE_CURRENCY` | `PKR` |
| `VITE_LOCALE` | `en` |

5. Deploy.
6. Copy the site URL (e.g. `https://labaik-mobile.vercel.app`).

---

## 4) Connect CORS (required)

1. Back on Render → Environment → set:

```text
CORS_ORIGINS=https://labaik-mobile.vercel.app,https://labaik-mobile-labaik-mobiles.vercel.app
```

(Add every Vercel domain you use. No trailing slash.)

2. Redeploy the API (or restart) so CORS updates.

---

## 5) Smoke test

1. Open the Vercel site → Home/Shop load products.
2. Open a product → **Order on WhatsApp** works.
3. Admin: `https://YOUR-SITE/admin/login` with the admin email/password you set.
4. If shop is empty or errors: check Render logs + `/api/v1/health`.

---

## Local run (still free)

```bash
# API
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# use sqlite for local if you want:
# DATABASE_URL=sqlite+pysqlite:///./labaikmobiles.db
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Web (other terminal)
cd apps/web
cp .env.example .env
npm install
npm run dev
```

---

## Admin image uploads (Supabase Storage)

1. Supabase → **Storage** → New bucket named `product-images` → **Public**
2. Render API env:
   - `SUPABASE_URL=https://ufmfvvvmrguouzhriurv.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=` (Settings → API → service_role secret)
   - `SUPABASE_STORAGE_BUCKET=product-images`
3. Redeploy API
4. Admin → Products → **Upload images** (no need to paste URLs)



| Problem | Fix |
|---------|-----|
| Vercel shows `404 NOT_FOUND` | Set Root Directory to `apps/web`, or use root `vercel.json`, then Redeploy |
| Shop empty / network error | `VITE_API_URL` wrong, or Render asleep — wait and retry |
| CORS blocked in browser | Put exact Vercel URL in Render `CORS_ORIGINS` |
| DB connection failed | Check Supabase password/URI; add `?sslmode=require` if needed |
| Admin login fails | Confirm `ADMIN_EMAIL` / `ADMIN_PASSWORD` on Render |

---

## Phase 5 status after this guide

- [x] Free deploy targets documented
- [x] Vercel monorepo build config
- [x] Render migrate-on-build + health check
- [ ] You create Supabase + fill secrets
- [ ] You deploy Render + Vercel and paste live URLs
- [ ] (Later) Supabase Storage image uploads
