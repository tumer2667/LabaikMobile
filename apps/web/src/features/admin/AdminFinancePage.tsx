import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

import { fetchFinanceReport } from '@/features/admin/api'
import type {
  FinancePaymentBreakdown,
  FinancePeriod,
  FinanceReport,
  FinanceSeriesPoint,
  FinanceTopProduct,
} from '@/features/admin/financeTypes'
import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/shared/api/client'
import { formatPkr } from '@/shared/lib/money'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

const PERIODS: { value: FinancePeriod; label: string; shortName: string }[] = [
  { value: 'day', label: 'Day', shortName: 'Today' },
  { value: 'week', label: 'Week', shortName: 'This week' },
  { value: 'month', label: 'Month', shortName: 'This month' },
  { value: 'year', label: 'Year', shortName: 'This year' },
]

type ChartMetric = 'sales_pkr' | 'revenue_pkr' | 'profit_pkr' | 'orders'

const CHART_METRICS: { key: ChartMetric; label: string; color: string }[] = [
  { key: 'sales_pkr', label: 'Sales', color: '#18a6e5' },
  { key: 'revenue_pkr', label: 'Revenue', color: '#59bc46' },
  { key: 'profit_pkr', label: 'Profit', color: '#0c6f9c' },
  { key: 'orders', label: 'Orders', color: '#f5a524' },
]

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue'

const PAY_COLORS = ['#18a6e5', '#59bc46', '#0c6f9c', '#f5a524', '#e5484d', '#6b7a90']

export function AdminFinancePage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const [period, setPeriod] = useState<FinancePeriod>('month')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [chartMetric, setChartMetric] = useState<ChartMetric>('sales_pkr')

  const params = useMemo(
    () => ({
      period,
      ...(fromDate ? { from_date: fromDate } : {}),
      ...(toDate ? { to_date: toDate } : {}),
    }),
    [period, fromDate, toDate],
  )

  const reportQuery = useQuery({
    queryKey: ['admin', 'finance', params],
    queryFn: () => fetchFinanceReport(params),
    enabled: isSuperAdmin,
  })

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />
  }

  const report = reportQuery.data
  const kpis = report?.kpis
  const changes = report?.changes
  const hasOrders = (kpis?.total_orders ?? 0) > 0
  const periodMeta = PERIODS.find((p) => p.value === period)

  return (
    <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-[#0b1220] p-4 text-white shadow-lift sm:p-6 md:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-brand-green/25 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-blue sm:text-xs">
              Super admin · Money report
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:mt-2 sm:text-3xl md:text-4xl">
              Sales & profit
            </h1>
            <p className="mt-2 hidden max-w-xl text-sm text-white/65 sm:block">
              See sales, money after refunds, profit, orders, and how customers paid.
            </p>
            {report ? (
              <p className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80 sm:mt-3 sm:text-xs">
                {formatRange(report.from_date, report.to_date)} · {periodMeta?.label}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link to="/admin/invoices/new">
              <Button className="w-full bg-brand-blue hover:bg-brand-blue-hover sm:w-auto">
                New invoice
              </Button>
            </Link>
            <Link to="/admin/invoices">
              <Button variant="secondary" className="w-full text-ink sm:w-auto">
                View invoices
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <Card className="space-y-3 !p-3 sm:space-y-4 sm:!p-4 md:!p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-surface p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  setPeriod(p.value)
                  setFromDate('')
                  setToDate('')
                }}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  period === p.value
                    ? 'bg-white text-ink shadow-soft'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-medium text-ink-secondary">
            {fromDate || toDate
              ? 'Custom dates selected'
              : `Showing: ${periodMeta?.shortName}`}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-medium text-ink">
            From date
            <input
              type="date"
              className={inputClass}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-ink">
            To date
            <input
              type="date"
              className={inputClass}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          <div className="flex items-end">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setFromDate('')
                setToDate('')
              }}
            >
              Show {periodMeta?.shortName.toLowerCase() ?? 'this month'}
            </Button>
          </div>
        </div>
      </Card>

      {reportQuery.isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(reportQuery.error)}
        </p>
      ) : null}

      {reportQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl sm:h-32" />
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          <HeroKpi
            label="Revenue"
            value={formatPkr(kpis.total_revenue_pkr)}
            change={changes?.revenue_pct}
            accent="from-brand-green/20 to-brand-green-soft"
            tone="text-brand-green-hover"
            sub={`Sales ${formatPkr(kpis.total_sales_pkr)} − refunds`}
          />
          <HeroKpi
            label="Profit"
            value={formatPkr(kpis.total_profit_pkr)}
            change={changes?.profit_pct}
            accent="from-brand-blue/20 to-brand-blue-soft"
            tone="text-brand-blue-deep"
            sub={`Margin ${kpis.margin_pct.toFixed(1)}%`}
          />
          <HeroKpi
            label="Orders"
            value={String(kpis.total_orders)}
            change={changes?.orders_pct}
            accent="from-amber-100 to-orange-50"
            tone="text-amber-700"
            sub={`Avg ${formatPkr(kpis.avg_order_value_pkr)}`}
          />
          <HeroKpi
            label="Refunds"
            value={formatPkr(kpis.total_refunds_pkr)}
            change={changes?.refunds_pct}
            invertTrend
            accent="from-rose-100 to-red-50"
            tone="text-danger"
            sub={`Rate ${kpis.refund_rate_pct.toFixed(1)}% of sales`}
          />
        </div>
      ) : null}

      {!reportQuery.isLoading && report && !hasOrders ? (
        <EmptyFinanceState />
      ) : null}

      {report && hasOrders ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">Trend</h2>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {CHART_METRICS.find((m) => m.key === chartMetric)?.label} by {period}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 rounded-xl bg-surface p-1">
                  {CHART_METRICS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setChartMetric(m.key)}
                      className={cn(
                        'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
                        chartMetric === m.key
                          ? 'bg-white text-ink shadow-soft'
                          : 'text-ink-muted hover:text-ink',
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <FinanceBarChart series={report.series} metric={chartMetric} />
            </Card>

            <InsightsPanel report={report} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="font-display text-lg font-semibold text-ink">Top products</h2>
              <p className="mt-0.5 text-sm text-ink-muted">Ranked by units sold</p>
              <TopProductsList products={report.top_products} />
            </Card>
            <Card>
              <h2 className="font-display text-lg font-semibold text-ink">Payment mix</h2>
              <p className="mt-0.5 text-sm text-ink-muted">Share of sales by method</p>
              <PaymentMix methods={report.payment_methods} />
            </Card>
          </div>
        </>
      ) : null}

      {report?.previous_from_date && report.previous_to_date ? (
        <p className="text-center text-xs text-ink-muted">
          Trends vs previous range {formatRange(report.previous_from_date, report.previous_to_date)}
        </p>
      ) : null}
    </div>
  )
}

function HeroKpi({
  label,
  value,
  change,
  sub,
  accent,
  tone,
  invertTrend = false,
}: {
  label: string
  value: string
  change?: number | null
  sub: string
  accent: string
  tone: string
  invertTrend?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-3.5 shadow-soft sm:p-5',
        accent,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted sm:text-xs">{label}</p>
      <p className={cn('mt-1.5 font-display text-xl font-semibold tabular-nums sm:mt-2 sm:text-2xl md:text-3xl', tone)}>
        {value}
      </p>
      <div className="mt-2 flex flex-col gap-1 sm:mt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <TrendBadge value={change} invert={invertTrend} />
        <span className="text-[11px] leading-snug text-ink-secondary sm:text-xs">{sub}</span>
      </div>
    </motion.div>
  )
}

function TrendBadge({ value, invert = false }: { value?: number | null; invert?: boolean }) {
  if (value == null) {
    return (
      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
        No prior data
      </span>
    )
  }
  const up = value > 0
  const flat = value === 0
  const good = invert ? !up : up
  if (flat) {
    return (
      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
        0% vs prior
      </span>
    )
  }
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
        good ? 'bg-brand-green-soft text-brand-green-hover' : 'bg-red-100 text-danger',
      )}
    >
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function InsightsPanel({ report }: { report: FinanceReport }) {
  const { kpis, top_products: products, payment_methods: methods } = report
  const topProduct = products[0]
  const topPay = methods[0]
  const health =
    kpis.refund_rate_pct <= 5 ? 'Healthy' : kpis.refund_rate_pct <= 15 ? 'Watch' : 'High'

  return (
    <Card className="flex flex-col gap-4 bg-gradient-to-b from-white to-brand-blue-soft/40">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Insights</h2>
        <p className="mt-0.5 text-sm text-ink-muted">Quick read for this range</p>
      </div>
      <InsightRow
        label="Gross margin"
        value={`${kpis.margin_pct.toFixed(1)}%`}
        hint={kpis.margin_pct === 0 ? 'Set product costs to unlock margin' : 'Profit ÷ revenue'}
      />
      <InsightRow
        label="Refund health"
        value={health}
        hint={`${kpis.refund_rate_pct.toFixed(1)}% of sales refunded`}
      />
      <InsightRow
        label="Best seller"
        value={topProduct?.name ?? '—'}
        hint={
          topProduct
            ? `${topProduct.quantity_sold} sold · ${formatPkr(topProduct.sales_pkr)}`
            : 'No product sales yet'
        }
      />
      <InsightRow
        label="Top payment"
        value={topPay?.label ?? '—'}
        hint={topPay ? `${topPay.pct}% of sales · ${topPay.orders} orders` : 'No payments yet'}
      />
      <InsightRow
        label="Gross sales"
        value={formatPkr(kpis.total_sales_pkr)}
        hint={`${changesLabel(report.changes?.sales_pct)} vs prior period`}
      />
    </Card>
  )
}

function InsightRow({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-white/80 px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1 truncate font-display text-base font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-secondary">{hint}</p>
    </div>
  )
}

function changesLabel(pct?: number | null) {
  if (pct == null) return 'No prior'
  if (pct === 0) return 'Flat'
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
}

function FinanceBarChart({
  series,
  metric,
}: {
  series: FinanceSeriesPoint[]
  metric: ChartMetric
}) {
  const meta = CHART_METRICS.find((m) => m.key === metric)!
  const values = series.map((p) => p[metric])
  const max = Math.max(1, ...values)
  const activeCount = values.filter((v) => v !== 0).length

  // Prefer last 12 buckets for readability when series is long
  const display = series.length > 14 ? series.slice(-14) : series

  return (
    <div className="mt-5">
      <div className="flex h-52 items-end gap-1.5 sm:gap-2">
        {display.map((point) => {
          const value = point[metric]
          const height = Math.max(value === 0 ? 2 : 8, Math.round((value / max) * 100))
          return (
            <div key={point.period_start} className="group flex min-w-0 flex-1 flex-col items-center">
              <div className="relative flex h-44 w-full items-end justify-center">
                <div
                  className="w-[70%] max-w-10 rounded-t-md transition group-hover:opacity-90"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${meta.color}, ${meta.color}99)`,
                    opacity: value === 0 ? 0.2 : 1,
                  }}
                  title={`${point.label}: ${metric === 'orders' ? value : formatPkr(value)}`}
                />
                <div className="pointer-events-none absolute -top-1 hidden -translate-y-full rounded-md bg-ink px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                  {metric === 'orders' ? value : compactPkr(value)}
                </div>
              </div>
              <p className="mt-2 w-full truncate text-center text-[10px] text-ink-muted">
                {shortLabel(point.label)}
              </p>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        {activeCount} of {series.length} {periodWord(series.length)} had activity · hover a bar for
        exact value
      </p>
    </div>
  )
}

function TopProductsList({ products }: { products: FinanceTopProduct[] }) {
  if (!products.length) {
    return <p className="mt-4 text-sm text-ink-secondary">No product sales in this range.</p>
  }
  const maxSales = Math.max(1, ...products.map((p) => p.sales_pkr))
  return (
    <ul className="mt-4 space-y-3">
      {products.slice(0, 6).map((p, index) => (
        <li key={`${p.product_id ?? p.name}-${index}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-blue-soft text-xs font-bold text-brand-blue-deep">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                <p className="shrink-0 text-sm tabular-nums text-ink-secondary">
                  {formatPkr(p.sales_pkr)}
                </p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-brand-blue"
                  style={{ width: `${(p.sales_pkr / maxSales) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-muted">
                {p.quantity_sold} sold · profit {formatPkr(p.profit_pkr)}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function PaymentMix({ methods }: { methods: FinancePaymentBreakdown[] }) {
  if (!methods.length) {
    return <p className="mt-4 text-sm text-ink-secondary">No payments in this range.</p>
  }

  const size = 148
  const stroke = 22
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2eaf2"
          strokeWidth={stroke}
        />
        {methods.map((m, i) => {
          const len = (m.pct / 100) * c
          const dash = `${len} ${c - len}`
          const el = (
            <circle
              key={m.method}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={PAY_COLORS[i % PAY_COLORS.length]}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += len
          return el
        })}
      </svg>
      <ul className="w-full space-y-2.5">
        {methods.map((m, i) => (
          <li key={m.method} className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PAY_COLORS[i % PAY_COLORS.length] }}
              />
              {m.label}
            </span>
            <span className="tabular-nums text-ink-secondary">
              {m.pct}% · {formatPkr(m.sales_pkr)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EmptyFinanceState() {
  return (
    <Card className="border-dashed bg-gradient-to-br from-brand-blue-soft/50 to-brand-green-soft/40 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-blue">
        No sales yet
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
        Create invoices to populate finance
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
        KPIs, trends, top products, and payment mix appear once invoices are issued. Add product
        cost for accurate profit.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link to="/admin/invoices/new">
          <Button>Create invoice</Button>
        </Link>
        <Link to="/admin/products">
          <Button variant="secondary">Set product costs</Button>
        </Link>
      </div>
    </Card>
  )
}

function formatRange(from: string, to: string) {
  return `${from} → ${to}`
}

function shortLabel(label: string) {
  if (label.includes('–')) return label.split('–')[0]?.trim() ?? label
  const parts = label.split(' ')
  if (parts.length >= 2 && parts[1]?.length === 4) return parts[0] ?? label
  return label
}

function periodWord(count: number) {
  return count === 1 ? 'bucket' : 'buckets'
}

function compactPkr(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(Math.round(value))
}
