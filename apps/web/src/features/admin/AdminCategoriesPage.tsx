import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import type { Category } from '@/entities/catalog/types'
import {
  createCategory,
  fetchAdminCategories,
  updateCategory,
} from '@/features/catalog/api'
import { Card } from '@/shared/ui/Card'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { getApiErrorMessage } from '@/shared/api/client'

type EditForm = {
  name: string
  description: string
  image_url: string
  show_price: boolean
  sort_order: string
  is_active: boolean
}

export function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  })
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    void queryClient.invalidateQueries({ queryKey: ['categories'] })
    void queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const toggleMutation = useMutation({
    mutationFn: ({ id, show_price }: { id: string; show_price: boolean }) =>
      updateCategory(id, { show_price }),
    onSuccess: invalidate,
  })

  const createMutation = useMutation({
    mutationFn: () => createCategory({ name, show_price: true }),
    onSuccess: () => {
      setName('')
      setError(null)
      invalidate()
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editing || !editForm) throw new Error('Nothing to update')
      return updateCategory(editing.id, {
        name: editForm.name.trim(),
        description: editForm.description,
        image_url: editForm.image_url.trim() || null,
        show_price: editForm.show_price,
        sort_order: Number(editForm.sort_order) || 0,
        is_active: editForm.is_active,
      })
    },
    onSuccess: () => {
      setEditing(null)
      setEditForm(null)
      setEditError(null)
      invalidate()
    },
    onError: (err) => setEditError(getApiErrorMessage(err)),
  })

  const openEdit = (c: Category) => {
    setEditing(c)
    setEditError(null)
    setEditForm({
      name: c.name,
      description: c.description,
      image_url: c.image_url ?? '',
      show_price: c.show_price,
      sort_order: String(c.sort_order),
      is_active: c.is_active,
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Categories</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Edit details and toggle <strong>Show price</strong> for the storefront.
        </p>
      </div>

      <Card className="flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 text-sm font-medium text-ink">
          New category
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
            placeholder="e.g. Mounts"
          />
        </label>
        <Button
          disabled={!name.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          Add category
        </Button>
        {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
      </Card>

      {editing && editForm ? (
        <Card className="space-y-4 border-brand-blue/30">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-ink">Edit category</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(null)
                setEditForm(null)
              }}
            >
              Close
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input
                className={inputClass}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                className={inputClass}
                value={editForm.sort_order}
                onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value })}
              />
            </Field>
            <Field label="Image URL">
              <input
                className={inputClass}
                value={editForm.image_url}
                onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <input
                className={inputClass}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.show_price}
                onChange={(e) => setEditForm({ ...editForm, show_price: e.target.checked })}
              />
              Show price on website
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
          {editError ? <p className="text-sm text-danger">{editError}</p> : null}
          <Button
            disabled={updateMutation.isPending || !editForm.name.trim()}
            onClick={() => updateMutation.mutate()}
          >
            {updateMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((c) => (
            <Card key={c.id} className="overflow-hidden !p-0">
              <ProductImage src={c.image_url ?? ''} alt={c.name} className="aspect-[16/9]" />
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">{c.name}</h2>
                  <p className="text-sm text-ink-muted">{c.product_count} products</p>
                </div>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2.5 text-sm">
                  <span className="font-medium text-ink">Show price on website</span>
                  <input
                    type="checkbox"
                    checked={c.show_price}
                    disabled={toggleMutation.isPending}
                    onChange={(e) =>
                      toggleMutation.mutate({ id: c.id, show_price: e.target.checked })
                    }
                    className="size-4 accent-brand-blue"
                  />
                </label>
                <Button size="sm" className="w-full" onClick={() => openEdit(c)}>
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
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
