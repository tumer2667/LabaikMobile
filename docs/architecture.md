# Phase 2 — Foundation notes

## Decisions applied

- Brand: **LabaikMobiles**
- Currency: **PKR** (API `currency_code`, web `VITE_CURRENCY`)
- Commerce: contact-to-order (shop CTAs → `/contact`)
- No payment / checkout modules in MVP scope
- Vite SPA (no SEO SSR)

## Color system

| Token | Value | Use |
|-------|-------|-----|
| brand-blue | `#18A6E5` | Primary CTA, links, focus |
| brand-green | `#59BC46` | Accent / success |
| ink | `#0B1220` | Primary text |
| surface | `#F7F9FB` | Page background |

Gradients (`bg-brand-gradient`, `text-brand-gradient`) used sparingly for brand moments.

## Free-tier deploy targets

- Web → Vercel (`apps/web`)
- API → Render (`apps/api`, `uvicorn app.main:app`)
- DB / Storage → Supabase (wired from Phase 3+)

## Product imagery

- **Now:** Unsplash demo URLs in `apps/web/src/entities/catalog/demo-data.ts` for UI review only.
- **Later:** Admin product media upload → Supabase Storage (`product-images` bucket). Store object keys on `product_images`; serve public CDN URLs. Demo dataset will be replaced by API-backed catalog.

## Category price visibility

- Column / field: `categories.show_price` (boolean, default `true`)
- Admin toggles per category whether customers see PKR on the storefront
- When `false`: UI shows **Contact for price** (no amount, no sale badges, no price sort for that category)
- Prices remain stored on products for admin / quotes; only storefront display is gated
- Demo: **Phones** and **Smart watches** have `showPrice: false`; accessories show prices

## Auth (Phase 3)

- JWT access (30m) + rotating refresh tokens (14d, hashed in DB)
- **Storefront is public** — no customer login/register in the UI
- Admin portal: `/admin/login` → `/admin/*`
- Endpoints: `POST /auth/admin/login`, `GET /auth/me`, `GET /admin/dashboard`, `GET /admin/session`
- Public `POST /auth/register` disabled
- Admin user seeded on API startup (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Local default DB: SQLite; production: Supabase Postgres

## Catalog (Phase 4)

- Tables: `brands`, `categories` (`show_price`), `products`, `product_images`
- Public: `GET /categories`, `/brands`, `/products`, `/products/{slug}`
- Admin: CRUD categories (incl. show_price toggle), brands, products (image URLs)
- Seeded demo catalog on first boot
- Storefront + admin UI consume API (no hardcoded demo dataset in pages)
