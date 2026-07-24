import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createProduct,
  fetchAdminBrands,
  fetchAdminCategories,
  fetchAdminProduct,
  updateProduct,
} from '@/features/catalog/api'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { getApiErrorMessage } from '@/shared/api/client'

type FormState = {
  name: string
  brand_id: string
  category_id: string
  price_pkr: string
  compare_at_pkr: string
  short_description: string
  description: string
  image_urls: string
  colors: string
  highlights: string
  in_stock: boolean
  is_featured: boolean
  is_new: boolean
  status: string
}

const emptyForm: FormState = {
  name: '',
  brand_id: '',
  category_id: '',
  price_pkr: '',
  compare_at_pkr: '',
  short_description: '',
  description: '',
  image_urls: '',
  colors: '',
  highlights: '',
  in_stock: true,
  is_featured: false,
  is_new: false,
  status: 'active',
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const productQuery = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => fetchAdminProduct(id!),
    enabled: isEdit,
  })
  const brandsQuery = useQuery({ queryKey: ['admin', 'brands'], queryFn: fetchAdminBrands })
  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  })

  useEffect(() => {
    if (!productQuery.data) return
    const p = productQuery.data
    setForm({
      name: p.name,
      brand_id: p.brand_id,
      category_id: p.category_id,
      price_pkr: String(p.price_pkr),
      compare_at_pkr: p.compare_at_pkr != null ? String(p.compare_at_pkr) : '',
      short_description: p.short_description,
      description: p.description,
      image_urls: p.images.join('\n'),
      colors: p.colors.join(', '),
      highlights: p.highlights.join('\n'),
      in_stock: p.in_stock,
      is_featured: p.is_featured,
      is_new: p.is_new,
      status: p.status,
    })
  }, [productQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        brand_id: form.brand_id,
        category_id: form.category_id,
        price_pkr: Number(form.price_pkr),
        compare_at_pkr: form.compare_at_pkr ? Number(form.compare_at_pkr) : null,
        short_description: form.short_description,
        description: form.description,
        image_urls: form.image_urls
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        colors: form.colors
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        highlights: form.highlights
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        in_stock: form.in_stock,
        is_featured: form.is_featured,
        is_new: form.is_new,
        status: form.status,
      }
      if (isEdit && id) return updateProduct(id, payload)
      return createProduct(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      if (id) void queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] })
      navigate('/admin/products')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (isEdit && productQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            {isEdit ? 'Edit product' : 'Add product'}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {isEdit ? 'Update catalog details and images.' : 'Create a new catalog item.'}
          </p>
        </div>
        <Link to="/admin/products">
          <Button variant="secondary">Back to list</Button>
        </Link>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Brand">
            <select
              className={inputClass}
              value={form.brand_id}
              onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
            >
              <option value="">Select brand</option>
              {(brandsQuery.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select
              className={inputClass}
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            >
              <option value="">Select category</option>
              {(categoriesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price (PKR)">
            <input
              type="number"
              className={inputClass}
              value={form.price_pkr}
              onChange={(e) => setForm((f) => ({ ...f, price_pkr: e.target.value }))}
            />
          </Field>
          <Field label="Compare-at price (optional)">
            <input
              type="number"
              className={inputClass}
              value={form.compare_at_pkr}
              onChange={(e) => setForm((f) => ({ ...f, compare_at_pkr: e.target.value }))}
            />
          </Field>
        </div>

        <Field label="Short description">
          <input
            className={inputClass}
            value={form.short_description}
            onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
          />
        </Field>
        <Field label="Full description">
          <textarea
            rows={4}
            className={inputClass}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Field>
        <Field label="Image URLs (one per line)">
          <textarea
            rows={3}
            className={inputClass}
            value={form.image_urls}
            onChange={(e) => setForm((f) => ({ ...f, image_urls: e.target.value }))}
            placeholder="https://…"
          />
        </Field>
        <Field label="Colors (comma-separated)">
          <input
            className={inputClass}
            value={form.colors}
            onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
          />
        </Field>
        <Field label="Highlights (one per line)">
          <textarea
            rows={3}
            className={inputClass}
            value={form.highlights}
            onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
          />
        </Field>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.in_stock}
              onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))}
            />
            In stock
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
            />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_new}
              onChange={(e) => setForm((f) => ({ ...f, is_new: e.target.checked }))}
            />
            New
          </label>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={
              saveMutation.isPending ||
              !form.name ||
              !form.brand_id ||
              !form.category_id ||
              form.price_pkr === ''
            }
            onClick={() => {
              setError(null)
              saveMutation.mutate()
            }}
          >
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </Button>
          <Link to="/admin/products">
            <Button variant="secondary">Cancel</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      {children}
    </label>
  )
}
