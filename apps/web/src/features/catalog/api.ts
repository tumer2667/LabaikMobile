import { apiClient } from '@/shared/api/client'
import type {
  Brand,
  Category,
  ProductDetail,
  ProductListParams,
  ProductListResponse,
} from '@/entities/catalog/types'

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories')
  return data
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data } = await apiClient.get<Brand[]>('/brands')
  return data
}

export async function fetchProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>('/products', { params })
  return data
}

export async function fetchProduct(slug: string): Promise<ProductDetail> {
  const { data } = await apiClient.get<ProductDetail>(`/products/${slug}`)
  return data
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/admin/categories')
  return data
}

export async function updateCategory(
  id: string,
  payload: Partial<{
    name: string
    description: string
    image_url: string | null
    show_price: boolean
    sort_order: number
    is_active: boolean
  }>,
): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/admin/categories/${id}`, payload)
  return data
}

export async function createCategory(payload: {
  name: string
  description?: string
  image_url?: string
  show_price?: boolean
}): Promise<Category> {
  const { data } = await apiClient.post<Category>('/admin/categories', payload)
  return data
}

export async function fetchAdminBrands(): Promise<Brand[]> {
  const { data } = await apiClient.get<Brand[]>('/admin/brands')
  return data
}

export async function fetchAdminProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>('/admin/products', { params })
  return data
}

export async function fetchAdminProduct(id: string): Promise<ProductDetail> {
  const { data } = await apiClient.get<ProductDetail>(`/admin/products/id/${id}`)
  return data
}

export async function createProduct(payload: Record<string, unknown>): Promise<ProductDetail> {
  const { data } = await apiClient.post<ProductDetail>('/admin/products', payload)
  return data
}

export async function updateProduct(
  id: string,
  payload: Record<string, unknown>,
): Promise<ProductDetail> {
  const { data } = await apiClient.patch<ProductDetail>(`/admin/products/${id}`, payload)
  return data
}

export async function archiveProduct(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`)
}

export async function createBrand(payload: {
  name: string
  is_active?: boolean
}): Promise<Brand> {
  const { data } = await apiClient.post<Brand>('/admin/brands', payload)
  return data
}

export async function updateBrand(
  id: string,
  payload: Partial<{ name: string; is_active: boolean }>,
): Promise<Brand> {
  const { data } = await apiClient.patch<Brand>(`/admin/brands/${id}`, payload)
  return data
}
