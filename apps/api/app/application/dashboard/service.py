"""Admin home dashboard: stats, recent activity, logins, invoices."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.application.catalog.service import dashboard_stats
from app.domain.models.enums import INVOICE_LIST_STATUSES, STAFF_ROLES
from app.infrastructure.db.models import Invoice, InvoiceRefund, Product, RefreshToken, User


def _iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.isoformat()


def _creator_name(invoice: Invoice) -> str | None:
    if invoice.created_by is not None:
        return invoice.created_by.full_name
    return None


def _invoice_list_item(invoice: Invoice) -> dict:
    refunded = sum(r.amount_pkr for r in invoice.refunds)
    return {
        "id": str(invoice.id),
        "number": invoice.number,
        "status": invoice.status,
        "customer_name": invoice.customer_name,
        "total_pkr": invoice.total_pkr,
        "refunded_pkr": refunded,
        "issued_at": _iso(invoice.issued_at),
        "created_at": _iso(invoice.created_at),
        "created_by_name": _creator_name(invoice),
        "line_count": len(invoice.lines),
    }


def _role_label(role: str) -> str:
    if role == "super_admin":
        return "Super admin"
    if role == "admin":
        return "Admin"
    return role


def recent_staff_logins(db: Session, *, limit: int = 5) -> list[dict]:
    """Latest staff sign-ins, using refresh-token creation as login/seen time."""
    staff_ids = list(
        db.scalars(select(User.id).where(User.role.in_(STAFF_ROLES))).all()
    )
    if not staff_ids:
        return []

    # Latest token per user
    tokens = list(
        db.scalars(
            select(RefreshToken)
            .where(RefreshToken.user_id.in_(staff_ids))
            .order_by(RefreshToken.created_at.desc())
            .limit(80)
        )
    )
    seen: set = set()
    rows: list[dict] = []
    users = {
        u.id: u
        for u in db.scalars(select(User).where(User.id.in_(staff_ids))).all()
    }
    for token in tokens:
        if token.user_id in seen:
            continue
        user = users.get(token.user_id)
        if user is None:
            continue
        seen.add(token.user_id)
        rows.append(
            {
                "user_id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "role_label": _role_label(user.role),
                "logged_in_at": _iso(token.created_at),
            }
        )
        if len(rows) >= limit:
            break
    return rows


def recent_invoices(db: Session, *, limit: int = 3) -> list[dict]:
    invoices = list(
        db.scalars(
            select(Invoice)
            .options(
                selectinload(Invoice.lines),
                selectinload(Invoice.created_by),
                selectinload(Invoice.refunds),
            )
            .where(Invoice.status.in_(INVOICE_LIST_STATUSES))
            .order_by(Invoice.created_at.desc())
            .limit(limit)
        )
    )
    return [_invoice_list_item(inv) for inv in invoices]


def recent_activity(db: Session, *, limit: int = 8) -> list[dict]:
    """Mixed feed: invoices, refunds, product updates, staff logins."""
    events: list[dict] = []

    for inv in db.scalars(
        select(Invoice)
        .options(selectinload(Invoice.created_by))
        .order_by(Invoice.created_at.desc())
        .limit(5)
    ):
        who = _creator_name(inv) or "Staff"
        events.append(
            {
                "type": "invoice",
                "title": f"Invoice {inv.number}",
                "detail": f"{who} · {inv.customer_name}",
                "at": _iso(inv.created_at),
                "href": f"/admin/invoices/{inv.id}",
            }
        )

    for refund in db.scalars(
        select(InvoiceRefund)
        .options(
            selectinload(InvoiceRefund.created_by),
            selectinload(InvoiceRefund.invoice),
        )
        .order_by(InvoiceRefund.created_at.desc())
        .limit(4)
    ):
        who = refund.created_by.full_name if refund.created_by else "Staff"
        inv_no = refund.invoice.number if refund.invoice else "—"
        events.append(
            {
                "type": "refund",
                "title": f"Refund {refund.number}",
                "detail": f"{who} · {inv_no} · {refund.amount_pkr} PKR",
                "at": _iso(refund.created_at),
                "href": f"/admin/invoices/{refund.invoice_id}",
            }
        )

    for product in db.scalars(
        select(Product).order_by(Product.updated_at.desc()).limit(4)
    ):
        events.append(
            {
                "type": "product",
                "title": f"Product updated",
                "detail": product.name,
                "at": _iso(product.updated_at),
                "href": f"/admin/products/{product.id}/edit",
            }
        )

    for login in recent_staff_logins(db, limit=4):
        events.append(
            {
                "type": "login",
                "title": "Staff login",
                "detail": f"{login['full_name']} ({login['role_label']})",
                "at": login["logged_in_at"],
                "href": "/admin/users" if login["role"] == "super_admin" else "/admin",
            }
        )

    events.sort(key=lambda e: e.get("at") or "", reverse=True)
    return events[:limit]


def build_dashboard(db: Session) -> dict:
    logins = recent_staff_logins(db, limit=5)
    return {
        "stats": dashboard_stats(db),
        "recent_invoices": recent_invoices(db, limit=3),
        "last_logins": logins,
        "last_login": logins[0] if logins else None,
        "recent_activity": recent_activity(db, limit=8),
        "notes": [],
    }
