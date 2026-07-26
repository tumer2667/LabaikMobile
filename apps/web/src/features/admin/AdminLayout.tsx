import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

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
  { to: '/admin', label: 'Dashboard', end: true },
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

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isSuperAdmin = user?.role === 'super_admin'

  const dashQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchAdminDashboard,
    staleTime: 30_000,
  })
  const stats = dashQuery.data?.stats

  const nav: NavItem[] = isSuperAdmin
    ? [
        ...baseNav.slice(0, 1),
        { to: '/admin/finance', label: 'Finance' },
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

  const onLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh bg-[#0b1220] text-white">
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0e1628] md:flex md:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <img src={logo} alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-0.5" />
          <div>
            <p className="font-display text-sm font-semibold">{appConfig.name}</p>
            <p className="text-xs text-white/50">{roleLabel(user?.role)}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Admin">
          {nav.map((item) => {
            const count =
              item.countKey && stats ? (stats[item.countKey] ?? null) : null
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={Boolean(item.end)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition',
                    'hover:bg-white/5 hover:text-white',
                    isActive && 'bg-brand-blue/20 text-brand-blue',
                  )
                }
              >
                <span>{item.label}</span>
                {count != null ? (
                  <span
                    className={cn(
                      'min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums',
                      'bg-white/10 text-white/70',
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </NavLink>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium">{user?.full_name || 'Admin'}</p>
          <p className="truncate text-xs text-white/50">{user?.email}</p>
          <p className="mt-1 text-[11px] text-white/40">{roleLabel(user?.role)}</p>
          <div className="mt-3 flex gap-2">
            <Link to="/" className="flex-1">
              <Button size="sm" variant="secondary" className="w-full text-ink">
                View site
              </Button>
            </Link>
            <Button size="sm" variant="ghost" className="text-white/80" onClick={() => void onLogout()}>
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-8">
          <div className="md:hidden">
            <p className="font-display font-semibold">{appConfig.name}</p>
            <p className="truncate text-xs text-white/50">{user?.full_name}</p>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-white/50">Signed in as</p>
            <p className="text-sm font-medium text-white">{user?.full_name || user?.email}</p>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Button size="sm" variant="ghost" className="text-white/80" onClick={() => void onLogout()}>
              Sign out
            </Button>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-auto bg-surface p-4 text-ink md:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
