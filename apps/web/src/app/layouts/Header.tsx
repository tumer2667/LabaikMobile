import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useEffect, useState } from 'react'

import logo from '@/assets/logo.png'
import { appConfig } from '@/shared/config/env'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
] as const

export function Header() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 12)
  })

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-40 border-b transition-[background,box-shadow,border-color] duration-300',
        scrolled || menuOpen
          ? 'border-border/90 bg-white/85 shadow-soft backdrop-blur-2xl'
          : 'border-transparent bg-white/55 backdrop-blur-xl',
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
          <motion.span
            whileHover={{ rotate: -4, scale: 1.05 }}
            className="relative inline-flex shrink-0"
          >
            <span className="absolute -inset-1 rounded-xl bg-brand-gradient opacity-0 blur transition group-hover:opacity-50" />
            <img
              src={logo}
              alt={`${appConfig.name} logo`}
              className="relative h-10 w-10 rounded-xl bg-white object-contain p-0.5 ring-1 ring-border"
            />
          </motion.span>
          <span className="truncate font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
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
          <Link to="/shop" className="hidden md:inline-flex">
            <Button size="sm" variant="secondary">
              Shop
            </Button>
          </Link>
          <Link to="/contact" className="hidden md:inline-flex">
            <Button size="sm" variant="gradient">
              Contact
            </Button>
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-ink shadow-soft md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className="relative block h-3.5 w-5">
              <span
                className={cn(
                  'absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-ink transition-transform duration-200',
                  menuOpen && 'top-1.5 rotate-45',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-ink transition-opacity duration-200',
                  menuOpen && 'opacity-0',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-3 block h-0.5 w-5 rounded-full bg-ink transition-transform duration-200',
                  menuOpen && 'top-1.5 -rotate-45',
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[4.25rem] z-40 bg-ink/40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full z-50 border-b border-border bg-white px-4 py-4 shadow-lift md:hidden"
            >
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-xl px-4 py-3 text-base font-semibold text-ink-secondary transition',
                          'hover:bg-surface hover:text-ink',
                          isActive && 'bg-brand-blue-soft text-brand-blue',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Link to="/shop" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" variant="secondary" className="w-full">
                    Shop
                  </Button>
                </Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" variant="gradient" className="w-full">
                    Contact
                  </Button>
                </Link>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  )
}
