export type Category = {
  id: string
  name: string
  slug: string
  description: string
  image_url: string | null
  show_price: boolean
  sort_order: number
  is_active: boolean
  product_count: number
}

export type Brand = {
  id: string
  name: string
  slug: string
  is_active: boolean
}

export type Product = {
  id: string
  name: string
  slug: string
  brand: string
  brand_slug: string
  category_slug: string
  category_name: string
  show_price: boolean
  price_pkr: number
  compare_at_pkr: number | null
  rating: number
  review_count: number
  in_stock: boolean
  is_featured: boolean
  is_new: boolean
  short_description: string
  primary_image: string | null
  images: string[]
}

export type ProductDetail = Product & {
  description: string
  colors: string[]
  highlights: string[]
  status: string
  created_at: string
}

export type ProductListResponse = {
  items: Product[]
  meta: { page: number; page_size: number; total: number }
}

export type ProductListParams = {
  category?: string
  brand?: string
  q?: string
  in_stock?: boolean
  featured?: boolean
  sort?: string
  page?: number
  page_size?: number
}
