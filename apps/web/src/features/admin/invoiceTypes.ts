export type InvoiceStatus = 'issued' | 'pending_delete'

export type InvoiceLine = {
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price_pkr: number
  line_total_pkr: number
  sort_order: number
}

export type InvoiceCreatorOption = {
  id: string
  full_name: string
}

export type InvoiceListItem = {
  id: string
  number: string
  status: InvoiceStatus
  customer_name: string
  customer_phone: string | null
  subtotal_pkr: number
  discount_pkr: number
  total_pkr: number
  issued_at: string
  created_at: string
  line_count: number
  created_by_id: string | null
  created_by_name: string | null
}

export type InvoiceDetail = InvoiceListItem & {
  customer_email: string | null
  notes: string
  lines: InvoiceLine[]
}

export type InvoiceLineCreate = {
  product_id: string
  quantity: number
  unit_price_pkr?: number | null
}

export type InvoiceCreatePayload = {
  customer_name: string
  customer_phone?: string | null
  customer_email?: string | null
  notes?: string
  discount_pkr?: number
  lines: InvoiceLineCreate[]
}

export type InvoiceListParams = {
  created_by?: string
  status?: InvoiceStatus
}
