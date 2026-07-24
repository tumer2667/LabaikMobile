import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

import logo from '@/assets/logo.jpeg'
import { appConfig } from '@/shared/config/env'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const

export function Header() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-border/80 bg-surface-elevated/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={logo}
            alt={`${appConfig.name} logo`}
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-border transition group-hover:ring-brand-blue/40"
          />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            {appConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium text-ink-secondary transition-colors',
                  'hover:bg-brand-blue-soft hover:text-ink',
                  isActive && 'bg-brand-blue-soft text-brand-blue',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/shop" className="hidden sm:inline-flex">
            <Button size="sm" variant="secondary">
              Browse
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="sm">Get in touch</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
