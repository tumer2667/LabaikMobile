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
      <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/15 via-transparent to-brand-green/12" />
      <div className="relative h-1 w-full bg-brand-gradient" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Single-line CTA — no wide empty stretch */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:px-5">
          <p className="text-sm text-white/75">
            <span className="font-display font-semibold text-white">Want to buy?</span>{' '}
            WhatsApp or call us.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              <Button variant="gradient" size="sm">
                WhatsApp
              </Button>
            </a>
            <a href={`tel:${primary.tel}`}>
              <Button
                variant="secondary"
                size="sm"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Call {primary.display}
              </Button>
            </a>
          </div>
        </div>

        {/* Even 4-column grid — equal gaps, no justify-between void */}
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src={logo}
                alt=""
                className="h-9 w-9 rounded-lg bg-white object-contain p-0.5 ring-1 ring-white/15"
              />
              <span className="font-display text-base font-semibold tracking-tight">
                {appConfig.name}
              </span>
            </Link>
            <p className="mt-3 text-sm leading-snug text-white/55">
              Phones & accessories.
              <br />
              Prices in {appConfig.currency}.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Pages
            </p>
            <nav aria-label="Footer" className="mt-3 flex flex-col gap-1.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="w-fit text-sm font-medium text-white/70 transition hover:text-brand-blue"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Address
            </p>
            <p className="mt-3 text-sm leading-snug text-white/70">
              Shop # 5, Block # 1
              <br />
              Near Ali Computer College
              <br />
              Karim Park, Lahore
            </p>
            <a
              href={mapsOpenUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-brand-blue transition hover:text-white"
            >
              Google Maps →
            </a>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Contact
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {businessInfo.phones.map((phone) => (
                <li key={phone.tel}>
                  <a
                    href={`tel:${phone.tel}`}
                    className="font-semibold text-brand-blue transition hover:text-white"
                  >
                    {phone.display}
                  </a>
                  <a
                    href={whatsappUrl(phone.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-[10px] font-bold uppercase tracking-wide text-brand-green transition hover:text-white"
                  >
                    WA
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${businessInfo.email}`}
              className="mt-3 block text-sm text-white/55 transition hover:text-brand-blue"
            >
              {businessInfo.email}
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-xs text-white/35 sm:px-6">
          <span>
            © {year} {appConfig.name}
          </span>
          <span>
            Lahore · {appConfig.currency}
          </span>
        </div>
      </div>
    </footer>
  )
}
