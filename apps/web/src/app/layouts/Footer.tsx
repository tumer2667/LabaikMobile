import { Link } from 'react-router-dom'

import logo from '@/assets/logo.png'
import { businessInfo, mapsOpenUrl, whatsappUrl } from '@/shared/config/business'
import { appConfig } from '@/shared/config/env'
import { Button } from '@/shared/ui/Button'

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
] as const

export function Footer() {
  const year = new Date().getFullYear()
  const primary = businessInfo.phones[0]
  const whatsappHref = whatsappUrl(primary.whatsapp, 'Hi, I want to place an order.')

  return (
    <footer className="relative mt-auto overflow-hidden text-white">
      <div className="absolute inset-0 bg-ink" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-green/15" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-brand-blue/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-10 h-48 w-48 rounded-full bg-brand-green/15 blur-3xl" />
      <div className="relative h-1 w-full bg-brand-gradient" />

      <div className="relative mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        {/* Brand + order CTA — one tight block on mobile */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-glow-blue">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
            <img
              src={logo}
              alt=""
              className="h-10 w-10 rounded-xl bg-white object-contain p-0.5 ring-1 ring-white/20"
            />
            <div className="min-w-0">
              <p className="font-display text-base font-semibold tracking-tight">{appConfig.name}</p>
              <p className="text-xs text-white/55">
                Phones & accessories · Prices in {appConfig.currency}
              </p>
            </div>
          </div>

          <div className="px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
            <p className="text-sm leading-snug text-white/75">
              <span className="font-display font-semibold text-white">Want to buy?</span>
              <span className="mt-0.5 block text-white/60 sm:mt-0 sm:ml-1.5 sm:inline">
                WhatsApp or call — we help with stock and order.
              </span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:flex sm:shrink-0">
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="sm:inline-flex">
                <Button variant="gradient" size="sm" className="w-full">
                  WhatsApp
                </Button>
              </a>
              <a href={`tel:${primary.tel}`} className="sm:inline-flex">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Call
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Pages as chips on mobile; list on desktop */}
        <div className="mt-6 sm:mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">
            Pages
          </p>
          <nav aria-label="Footer" className="mt-3 flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-sm font-semibold text-white/80 transition hover:border-brand-blue/40 hover:bg-brand-blue/15 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Address + contact cards */}
        <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green">
              Visit shop
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              {businessInfo.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <a
              href={mapsOpenUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue transition hover:text-white"
            >
              Open Google Maps
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green">
              Call / WhatsApp
            </p>
            <ul className="mt-2 space-y-2">
              {businessInfo.phones.map((phone) => (
                <li
                  key={phone.tel}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.05] px-3 py-2"
                >
                  <a
                    href={`tel:${phone.tel}`}
                    className="text-sm font-semibold text-white transition hover:text-brand-blue"
                  >
                    {phone.display}
                  </a>
                  <a
                    href={whatsappUrl(phone.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-brand-green/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-green transition hover:bg-brand-green hover:text-white"
                  >
                    WhatsApp
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${businessInfo.email}`}
              className="mt-3 block truncate text-sm text-white/55 transition hover:text-brand-blue"
            >
              {businessInfo.email}
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-3.5 text-center text-xs text-white/40 sm:flex-row sm:px-6 sm:text-left">
          <span>
            © {year} {appConfig.name}
          </span>
          <span>Karim Park, Lahore · {appConfig.currency}</span>
        </div>
      </div>
    </footer>
  )
}
