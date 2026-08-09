import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import logo from '@/assets/logo.png'
import { appConfig } from '@/shared/config/env'
import { fetchAdminDashboard } from '@/features/admin/api'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'

type NavItem = {
  to: string
  label: string
  end?: boolean
  countKey?: 'categories' | 'invoices' | 'invoice_review' | 'users'
}

const baseNav: NavItem[] = [
  { to: '/admin', label: 'Home', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories', countKey: 'categories' },
  { to: '/admin/brands', label: 'Brands' },
  { to: '/admin/invoices', label: 'Invoices', countKey: 'invoices' },
  { to: '/admin/settings', label: 'Settings' },
]

function roleLabel(role: string | undefined) {
  if (role === 'super_admin') return 'Super admin'
  if (role === 'admin') return 'Admin'
  return 'Admin'
}

function pageTitle(pathname: string) {
  if (pathname === '/admin' || pathname === '/admin/') return 'Home'
  if (pathname.startsWith('/admin/finance')) return 'Money'
  if (pathname.startsWith('/admin/products')) return 'Products'
  if (pathname.startsWith('/admin/categories')) return 'Categories'
  if (pathname.startsWith('/admin/brands')) return 'Brands'
  if (pathname.startsWith('/admin/invoice-review')) return 'Invoice review'
  if (pathname.startsWith('/admin/invoices')) return 'Invoices'
  if (pathname.startsWith('/admin/users')) return 'Users'
  if (pathname.startsWith('/admin/settings')) return 'Settings'
  return 'Admin'
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isSuperAdmin = user?.role === 'super_admin'
  const [menuOpen, setMenuOpen] = useState(false)

  const dashQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchAdminDashboard,
    staleTime: 30_000,
  })
  const stats = dashQuery.data?.stats

  const nav: NavItem[] = isSuperAdmin
    ? [
        ...baseNav.slice(0, 1),
        { to: '/admin/finance', label: 'Money' },
        ...baseNav.slice(1, 5),
        {
          to: '/admin/invoice-review',
          label: 'Invoice review',
          countKey: 'invoice_review',
        },
        { to: '/admin/users', label: 'Users', countKey: 'users' },
        ...baseNav.slice(5),
      ]
    : [...baseNav]

  const mobileTabs = isSuperAdmin
    ? [
        { to: '/admin', label: 'Home', end: true },
        { to: '/admin/finance', label: 'Money' },
        { to: '/admin/invoices', label: 'Invoices' },
        { to: '/admin/products', label: 'Products' },
      ]
    : [
        { to: '/admin', label: 'Home', end: true },
        { to: '/admin/invoices', label: 'Invoices' },
        { to: '/admin/products', label: 'Products' },
        { to: '/admin/categories', label: 'Categories' },
      ]

  const onLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/admin/login', { replace: true })
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

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

  const navLinks = (onNavigate?: () => void) =>
    nav.map((item) => {
      const count = item.countKey && stats ? (stats[item.countKey] ?? null) : null
      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={Boolean(item.end)}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 transition',
              'hover:bg-white/5 hover:text-white',
              isActive && 'bg-brand-blue/20 text-brand-blue',
            )
          }
        >
          <span>{item.label}</span>
          {count != null ? (
            <span className="min-w-6 rounded-full bg-white/10 px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums text-white/70">
              {count}
            </span>
          ) : null}
        </NavLink>
      )
    })

  const accountFooter = (
    <div className="shrink-0 border-t border-white/10 bg-[#0e1628] p-4">
      <p className="truncate text-sm font-medium">{user?.full_name || 'Admin'}</p>
      <p className="truncate text-xs text-white/50">{user?.email}</p>
      <p className="mt-1 text-[11px] text-white/40">{roleLabel(user?.role)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <Button size="sm" variant="secondary" className="w-full text-ink">
            View site
          </Button>
        </Link>
        <Button size="sm" variant="ghost" className="w-full text-white/80" onClick={() => void onLogout()}>
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-dvh overflow-hidden bg-[#0b1220] text-white">
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-white/10 bg-[#0e1628] md:flex">
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5">
          <img src={logo} alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-0.5" />
          <div>
            <p className="font-display text-sm font-semibold">{appConfig.name}</p>
            <p className="text-xs text-white/50">{roleLabel(user?.role)}</p>
          </div>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Admin">
          {navLinks()}
        </nav>
        {accountFooter}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 md:px-8 md:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 md:hidden">
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white active:bg-white/10"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={cn(
                    'absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-white transition-transform duration-200',
                    menuOpen && 'top-1.5 rotate-45',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-white transition-opacity duration-200',
                    menuOpen && 'opacity-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-3 block h-0.5 w-5 rounded-full bg-white transition-transform duration-200',
                    menuOpen && 'top-1.5 -rotate-45',
                  )}
                />
              </span>
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold tracking-tight">
                {pageTitle(location.pathname)}
              </p>
              <p className="truncate text-[11px] text-white/50">
                {user?.full_name || 'Admin'} · {roleLabel(user?.role)}
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-sm text-white/50">Signed in as</p>
            <p className="text-sm font-medium text-white">{user?.full_name || user?.email}</p>
          </div>

          <Link
            to="/admin/invoices/new"
            className="shrink-0 md:hidden"
          >
            <Button size="sm" className="h-10 px-3">
              + Invoice
            </Button>
          </Link>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-0 flex-1 overflow-y-auto bg-surface px-3 py-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-ink md:p-8 md:pb-8"
        >
          <Outlet />
        </motion.main>

        {/* Mobile bottom tabs */}
        <nav
          aria-label="Quick links"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0e1628]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-1.5">
            {mobileTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={Boolean(tab.end)}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold transition',
                    isActive ? 'bg-brand-blue/20 text-brand-blue' : 'text-white/55 active:bg-white/5',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold text-white/55 active:bg-white/5"
            >
              More
            </button>
          </div>
        </nav>
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
              className="fixed inset-0 z-40 bg-black/55 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(19rem,88vw)] flex-col border-r border-white/10 bg-[#0e1628] shadow-lift md:hidden"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={logo}
                    alt=""
                    className="h-9 w-9 rounded-lg bg-white object-contain p-0.5"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold">{appConfig.name}</p>
                    <p className="text-xs text-white/50">{roleLabel(user?.role)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Close
                </button>
              </div>
              <nav
                className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
                aria-label="Admin mobile"
              >
                {navLinks(() => setMenuOpen(false))}
              </nav>
              {accountFooter}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
