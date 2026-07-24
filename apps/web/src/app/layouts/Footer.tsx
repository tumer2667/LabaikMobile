import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import logo from '@/assets/logo.png'
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
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-ink text-white">
      <div className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-brand-blue/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-brand-green/20 blur-3xl" />
      <div className="h-1 w-full bg-brand-gradient" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt=""
              className="h-10 w-10 rounded-xl bg-white object-contain p-0.5 ring-1 ring-white/15"
            />
            <p className="font-display text-xl font-semibold">{appConfig.name}</p>
          </div>
          <p className="text-sm leading-relaxed text-white/65">
            Premium mobile phones and accessories. Prices in {appConfig.currency}. Reach out to
            order — we handle fulfillment personally.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
          {footerLinks.map((link) => (
            <motion.div key={link.to} whileHover={{ y: -2 }}>
              <Link
                to={link.to}
                className="text-sm font-semibold text-white/70 transition hover:text-brand-blue"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-white/45 sm:px-6">
          <span>
            © {year} {appConfig.name}. All rights reserved.
          </span>
          <span className="hidden sm:inline">English · {appConfig.currency}</span>
        </div>
      </div>
    </footer>
  )
}
