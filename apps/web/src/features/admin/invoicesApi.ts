import { apiClient } from '@/shared/api/client'
import type {
  InvoiceCreatePayload,
  InvoiceCreatorOption,
  InvoiceDetail,
  InvoiceListItem,
  InvoiceListParams,
  RefundCreatePayload,
} from '@/features/admin/invoiceTypes'

export async function fetchAdminInvoices(
  params: InvoiceListParams = {},
): Promise<InvoiceListItem[]> {
  const { data } = await apiClient.get<InvoiceListItem[]>('/admin/invoices', { params })
  return data
}

export async function fetchInvoiceCreators(): Promise<InvoiceCreatorOption[]> {
  const { data } = await apiClient.get<InvoiceCreatorOption[]>('/admin/invoices/creators')
  return data
}

export async function fetchAdminInvoice(id: string): Promise<InvoiceDetail> {
  const { data } = await apiClient.get<InvoiceDetail>(`/admin/invoices/${id}`)
  return data
}

export async function fetchAdminInvoiceByNumber(number: string): Promise<InvoiceDetail> {
  const { data } = await apiClient.get<InvoiceDetail>(
    `/admin/invoices/by-number/${encodeURIComponent(number)}`,
  )
  return data
}

export async function createAdminInvoice(payload: InvoiceCreatePayload): Promise<InvoiceDetail> {
  const { data } = await apiClient.post<InvoiceDetail>('/admin/invoices', payload)
  return data
}

export async function createAdminRefund(
  invoiceId: string,
  payload: RefundCreatePayload,
): Promise<InvoiceDetail> {
  const { data } = await apiClient.post<InvoiceDetail>(
    `/admin/invoices/${invoiceId}/refunds`,
    payload,
  )
  return data
}

export async function requestDeleteAdminInvoice(id: string): Promise<InvoiceDetail> {
  const { data } = await apiClient.post<InvoiceDetail>(`/admin/invoices/${id}/request-delete`)
  return data
}

export async function deleteAdminInvoice(id: string): Promise<void> {
  await apiClient.delete(`/admin/invoices/${id}`)
}
