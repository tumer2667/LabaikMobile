from enum import StrEnum


class UserRole(StrEnum):
    CUSTOMER = "customer"
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"  # sub-admin: same access as super_admin except user management


STAFF_ROLES = frozenset({UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value})


class UserStatus(StrEnum):
    ACTIVE = "active"
    DISABLED = "disabled"


class ProductStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class InvoiceStatus(StrEnum):
    ISSUED = "issued"
    PARTIALLY_REFUNDED = "partially_refunded"
    REFUNDED = "refunded"
    PENDING_DELETE = "pending_delete"  # admin requested deletion; awaits super admin


# Shown on the main invoices list (excludes deletion review).
INVOICE_LIST_STATUSES = frozenset(
    {
        InvoiceStatus.ISSUED.value,
        InvoiceStatus.PARTIALLY_REFUNDED.value,
        InvoiceStatus.REFUNDED.value,
    }
)


class PaymentMethod(StrEnum):
    CASH = "cash"
    JAZZCASH = "jazzcash"
    EASYPAISA = "easypaisa"
    BANK_TRANSFER = "bank_transfer"
    CARD = "card"
    OTHER = "other"


PAYMENT_METHODS = frozenset(m.value for m in PaymentMethod)


class RefundStatus(StrEnum):
    COMPLETED = "completed"
