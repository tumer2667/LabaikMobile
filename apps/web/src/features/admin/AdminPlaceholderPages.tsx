import { Card } from '@/shared/ui/Card'

export function AdminOrdersPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-semibold text-ink">Orders</h1>
      <Card>
        <p className="text-ink-secondary">
          No online checkout yet — customers contact you to order. Order management will track
          enquiry → confirmed → fulfilled in a later phase.
        </p>
      </Card>
    </div>
  )
}

export function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
      <Card className="space-y-3 text-sm text-ink-secondary">
        <p>
          <span className="font-medium text-ink">Currency:</span> PKR
        </p>
        <p>
          <span className="font-medium text-ink">Locale:</span> English
        </p>
        <p>
          <span className="font-medium text-ink">Commerce:</span> Contact-to-order (no payments)
        </p>
        <p className="text-ink-muted">Store settings API arrives with the CMS / settings module.</p>
      </Card>
    </div>
  )
}
