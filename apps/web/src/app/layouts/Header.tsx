import { Link, NavLink } from 'react-router-dom'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

import logo from '@/assets/logo.png'
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
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 12)
  })

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-40 border-b transition-[background,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-border/90 bg-white/85 shadow-soft backdrop-blur-2xl'
          : 'border-transparent bg-white/55 backdrop-blur-xl',
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <motion.span
            whileHover={{ rotate: -4, scale: 1.05 }}
            className="relative inline-flex"
          >
            <span className="absolute -inset-1 rounded-xl bg-brand-gradient opacity-0 blur transition group-hover:opacity-50" />
            <img
              src={logo}
              alt={`${appConfig.name} logo`}
              className="relative h-10 w-10 rounded-xl bg-white object-contain p-0.5 ring-1 ring-border"
            />
          </motion.span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
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
                  'relative rounded-full px-4 py-2 text-sm font-semibold text-ink-secondary transition-colors',
                  'hover:text-ink',
                  isActive && 'text-brand-blue',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-brand-blue-soft"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                </>
              )}
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
            <Button size="sm" variant="gradient">
              Get in touch
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
