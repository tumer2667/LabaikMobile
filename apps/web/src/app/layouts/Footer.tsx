import { Link } from 'react-router-dom'

import { appConfig } from '@/shared/config/env'

const footerLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-surface-elevated/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="font-display text-xl font-semibold text-ink">{appConfig.name}</p>
          <p className="text-sm leading-relaxed text-ink-muted">
            Premium mobile phones and accessories. Prices in {appConfig.currency}. Reach out
            to order — we handle fulfillment personally.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-ink-secondary transition hover:text-brand-blue"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-ink-muted sm:px-6">
          <span>
            © {year} {appConfig.name}. All rights reserved.
          </span>
          <span className="hidden sm:inline">English · {appConfig.currency}</span>
        </div>
      </div>
    </footer>
  )
}
