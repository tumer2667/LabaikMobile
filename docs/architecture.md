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
