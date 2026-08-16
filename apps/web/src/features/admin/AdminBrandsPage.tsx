import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, type ReactNode } from 'react'

import type { Brand } from '@/entities/catalog/types'
import { createBrand, deleteBrand, fetchAdminBrands, updateBrand } from '@/features/catalog/api'
import { Card } from '@/shared/ui/Card'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { getApiErrorMessage } from '@/shared/api/client'

export function AdminBrandsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: fetchAdminBrands,
  })
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [editName, setEditName] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editError, setEditError] = useState<string | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] })
    void queryClient.invalidateQueries({ queryKey: ['brands'] })
  }

  const closeEdit = useCallback(() => {
    setEditing(null)
    setEditError(null)
  }, [])

  const createMutation = useMutation({
    mutationFn: () => createBrand({ name }),
    onSuccess: () => {
      setName('')
      setError(null)
      invalidate()
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error('No brand selected')
      return updateBrand(editing.id, { name: editName.trim(), is_active: editActive })
    },
    onSuccess: () => {
      closeEdit()
      invalidate()
    },
    onError: (err) => setEditError(getApiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      setError(null)
      closeEdit()
      invalidate()
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  return (
    <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">Brands</h1>
        <p className="mt-1 text-sm text-ink-secondary">Create and edit brands used by products.</p>
      </div>

      <Card className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="min-w-0 flex-1 text-sm font-medium text-ink">
          New brand
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
            placeholder="e.g. Spigen"
          />
        </label>
        <Button
          className="w-full sm:w-auto"
          disabled={!name.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          Add brand
        </Button>
        {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
      </Card>

      <Modal
        open={Boolean(editing)}
        title="Edit brand"
        onClose={closeEdit}
        className="sm:max-w-md"
      >
        <div className="space-y-4">
          <Field label="Name">
            <input
              className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editActive}
              onChange={(e) => setEditActive(e.target.checked)}
            />
            Active
          </label>
          {editError ? <p className="text-sm text-danger">{editError}</p> : null}
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={closeEdit}>
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={updateMutation.isPending || !editName.trim()}
              onClick={() => updateMutation.mutate()}
            >
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </Modal>

      <Card className="overflow-hidden !p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {(data ?? []).map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{b.name}</p>
                  <p className="text-xs text-ink-muted">
                    {b.slug} · {b.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setEditing(b)
                      setEditName(b.name)
                      setEditActive(b.is_active)
                      setEditError(null)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-danger hover:bg-red-50 sm:w-auto"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        confirm(
                          `Delete brand “${b.name}”? Only works if no products use it.`,
                        )
                      ) {
                        deleteMutation.mutate(b.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      {children}
    </label>
  )
}
