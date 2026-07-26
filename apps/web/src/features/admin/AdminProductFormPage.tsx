import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createProduct,
  fetchAdminBrands,
  fetchAdminCategories,
  fetchAdminProduct,
  updateProduct,
  uploadAdminImage,
} from '@/features/catalog/api'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Skeleton } from '@/shared/ui/Skeleton'
import { getApiErrorMessage } from '@/shared/api/client'

type FormState = {
  name: string
  brand_id: string
  category_id: string
  price_pkr: string
  compare_at_pkr: string
  cost_pkr: string
  short_description: string
  description: string
  image_urls: string
  colors: string
  highlights: string
  in_stock: boolean
  is_featured: boolean
  is_new: boolean
  show_price: boolean
  status: string
}

const emptyForm: FormState = {
  name: '',
  brand_id: '',
  category_id: '',
  price_pkr: '',
  compare_at_pkr: '',
  cost_pkr: '0',
  short_description: '',
  description: '',
  image_urls: '',
  colors: '',
  highlights: '',
  in_stock: true,
  is_featured: false,
  is_new: false,
  show_price: true,
  status: 'active',
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

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
      cost_pkr: String(p.cost_pkr ?? 0),
      short_description: p.short_description,
      description: p.description,
      image_urls: p.images.join('\n'),
      colors: p.colors.join(', '),
      highlights: p.highlights.join('\n'),
      in_stock: p.in_stock,
      is_featured: p.is_featured,
      is_new: p.is_new,
      show_price: p.show_price,
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
        cost_pkr: form.cost_pkr === '' ? 0 : Number(form.cost_pkr),
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
        show_price: form.show_price,
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

  const imageList = form.image_urls
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const onUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError(null)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const result = await uploadAdminImage(file, 'products')
        uploaded.push(result.url)
      }
      setForm((f) => {
        const existing = f.image_urls
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
        return { ...f, image_urls: [...existing, ...uploaded].join('\n') }
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Image upload failed'))
    } finally {
      setUploading(false)
    }
  }

  const removeImageAt = (index: number) => {
    setForm((f) => {
      const next = f.image_urls
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      next.splice(index, 1)
      return { ...f, image_urls: next.join('\n') }
    })
  }

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
          <Field label="Cost (PKR)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.cost_pkr}
              onChange={(e) => setForm((f) => ({ ...f, cost_pkr: e.target.value }))}
            />
            <p className="mt-1 text-xs text-ink-muted">
              Used for profit on the Finance dashboard (snapshotted onto invoices).
            </p>
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
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">Product images</p>
          <p className="text-xs text-ink-muted">
            Upload photos from your computer (JPG/PNG/WEBP, max 5MB each). You can still paste a URL
            below if needed.
          </p>
          <label className="inline-flex cursor-pointer">
            <span className="rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow-blue">
              {uploading ? 'Uploading…' : 'Upload images'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void onUploadFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
          {imageList.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {imageList.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <ProductImage src={url} alt="" className="aspect-square" />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white"
                    onClick={() => removeImageAt(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <Field label="Image URLs (optional — one per line)">
            <textarea
              rows={3}
              className={inputClass}
              value={form.image_urls}
              onChange={(e) => setForm((f) => ({ ...f, image_urls: e.target.value }))}
              placeholder="Uploaded images appear here automatically"
            />
          </Field>
        </div>
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
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.show_price}
              onChange={(e) => setForm((f) => ({ ...f, show_price: e.target.checked }))}
            />
            Show price on website
          </label>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={
              saveMutation.isPending ||
              uploading ||
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
