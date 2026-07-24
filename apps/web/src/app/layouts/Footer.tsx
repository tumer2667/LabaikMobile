import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import logo from '@/assets/logo.png'
import { businessInfo } from '@/shared/config/business'
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

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_auto_1fr]">
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
            Phones and accessories in {appConfig.currency}. Visit us in Karim Park, or call /
            WhatsApp to order.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 md:justify-center">
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

        <div className="space-y-2 text-sm text-white/65 md:text-right">
          <p className="font-semibold text-white/85">Visit</p>
          <p>{businessInfo.addressLines[0]}</p>
          <p>{businessInfo.addressLines[1]}</p>
          <p>{businessInfo.addressLines[2]}</p>
          <div className="flex flex-col gap-1 pt-2 md:items-end">
            {businessInfo.phones.map((phone) => (
              <a
                key={phone.tel}
                href={`tel:${phone.tel}`}
                className="font-semibold text-brand-blue transition hover:text-white"
              >
                {phone.display}
              </a>
            ))}
          </div>
        </div>
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
