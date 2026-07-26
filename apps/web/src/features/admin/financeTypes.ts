export type FinancePeriod = 'day' | 'week' | 'month' | 'year'

export type FinanceKpis = {
  total_sales_pkr: number
  total_revenue_pkr: number
  total_profit_pkr: number
  total_orders: number
  total_refunds_pkr: number
  avg_order_value_pkr: number
  refund_rate_pct: number
  margin_pct: number
}

export type FinanceSeriesPoint = {
  label: string
  period_start: string
  sales_pkr: number
  revenue_pkr: number
  profit_pkr: number
  orders: number
  refunds_pkr: number
}

export type FinanceTopProduct = {
  product_id: string | null
  name: string
  quantity_sold: number
  sales_pkr: number
  profit_pkr: number
}

export type FinancePaymentBreakdown = {
  method: string
  label: string
  orders: number
  sales_pkr: number
  pct: number
}

export type FinanceReport = {
  period: FinancePeriod
  from_date: string
  to_date: string
  previous_from_date?: string | null
  previous_to_date?: string | null
  kpis: FinanceKpis
  previous_kpis?: FinanceKpis | null
  changes?: {
    sales_pct?: number | null
    revenue_pct?: number | null
    profit_pct?: number | null
    orders_pct?: number | null
    refunds_pct?: number | null
  }
  series: FinanceSeriesPoint[]
  top_products: FinanceTopProduct[]
  payment_methods: FinancePaymentBreakdown[]
  notes: string[]
}

export type FinanceReportParams = {
  period?: FinancePeriod
  from_date?: string
  to_date?: string
}

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
] as const
