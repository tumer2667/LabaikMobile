"""Admin invoice creation, refunds, and lookup."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.domain.models.enums import (
    INVOICE_LIST_STATUSES,
    InvoiceStatus,
    RefundStatus,
)
from app.infrastructure.db.models import Invoice, InvoiceLine, InvoiceRefund, Product, User
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceCreatorOption,
    InvoiceDetail,
    InvoiceLineResponse,
    InvoiceListItem,
    RefundCreate,
    RefundResponse,
)


def _creator_name(invoice: Invoice) -> str | None:
    if invoice.created_by is not None:
        return invoice.created_by.full_name
    return None


def _refunded_total(invoice: Invoice) -> int:
    return sum(r.amount_pkr for r in invoice.refunds)


def _to_refund_response(refund: InvoiceRefund, invoice_number: str) -> RefundResponse:
    created_by_name = refund.created_by.full_name if refund.created_by is not None else None
    return RefundResponse(
        id=refund.id,
        number=refund.number,
        invoice_id=refund.invoice_id,
        invoice_number=invoice_number,
        amount_pkr=refund.amount_pkr,
        reason=refund.reason,
        status=refund.status,
        created_by_id=refund.created_by_id,
        created_by_name=created_by_name,
        created_at=refund.created_at,
    )


def _to_line_response(line: InvoiceLine) -> InvoiceLineResponse:
    return InvoiceLineResponse.model_validate(line)


def _to_list_item(invoice: Invoice, line_count: int | None = None) -> InvoiceListItem:
    count = line_count if line_count is not None else len(invoice.lines)
    refunded = _refunded_total(invoice)
    return InvoiceListItem(
        id=invoice.id,
        number=invoice.number,
        status=invoice.status,
        customer_name=invoice.customer_name,
        customer_phone=invoice.customer_phone,
        subtotal_pkr=invoice.subtotal_pkr,
        discount_pkr=invoice.discount_pkr,
        total_pkr=invoice.total_pkr,
        refunded_pkr=refunded,
        remaining_pkr=max(0, invoice.total_pkr - refunded),
        issued_at=invoice.issued_at,
        created_at=invoice.created_at,
        line_count=count,
        created_by_id=invoice.created_by_id,
        created_by_name=_creator_name(invoice),
    )


def _to_detail(invoice: Invoice) -> InvoiceDetail:
    base = _to_list_item(invoice)
    return InvoiceDetail(
        **base.model_dump(),
        customer_email=invoice.customer_email,
        notes=invoice.notes,
        lines=[_to_line_response(line) for line in invoice.lines],
        refunds=[_to_refund_response(r, invoice.number) for r in invoice.refunds],
    )


def _invoice_query():
    return select(Invoice).options(
        selectinload(Invoice.lines),
        selectinload(Invoice.created_by),
        selectinload(Invoice.refunds).selectinload(InvoiceRefund.created_by),
    )


def _get_invoice_or_404(db: Session, invoice_id: UUID) -> Invoice:
    invoice = db.scalar(_invoice_query().where(Invoice.id == invoice_id))
    if invoice is None:
        raise AppError(
            "Invoice not found",
            code="invoice_not_found",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    return invoice


def _next_invoice_number(db: Session) -> str:
    year = datetime.now(UTC).year
    prefix = f"INV-{year}-"
    latest = db.scalar(
        select(Invoice.number)
        .where(Invoice.number.like(f"{prefix}%"))
        .order_by(Invoice.number.desc())
        .limit(1)
    )
    seq = 1
    if latest:
        try:
            seq = int(latest.rsplit("-", 1)[-1]) + 1
        except ValueError:
            seq = 1
    return f"{prefix}{seq:04d}"


def _next_refund_number(db: Session) -> str:
    year = datetime.now(UTC).year
    prefix = f"REF-{year}-"
    latest = db.scalar(
        select(InvoiceRefund.number)
        .where(InvoiceRefund.number.like(f"{prefix}%"))
        .order_by(InvoiceRefund.number.desc())
        .limit(1)
    )
    seq = 1
    if latest:
        try:
            seq = int(latest.rsplit("-", 1)[-1]) + 1
        except ValueError:
            seq = 1
    return f"{prefix}{seq:04d}"


def _sync_invoice_refund_status(invoice: Invoice) -> None:
    if invoice.status == InvoiceStatus.PENDING_DELETE.value:
        return
    refunded = _refunded_total(invoice)
    if refunded <= 0:
        invoice.status = InvoiceStatus.ISSUED.value
    elif refunded >= invoice.total_pkr:
        invoice.status = InvoiceStatus.REFUNDED.value
    else:
        invoice.status = InvoiceStatus.PARTIALLY_REFUNDED.value


def list_invoice_creators(db: Session) -> list[InvoiceCreatorOption]:
    rows = db.execute(
        select(User.id, User.full_name)
        .join(Invoice, Invoice.created_by_id == User.id)
        .distinct()
        .order_by(User.full_name.asc())
    ).all()
    return [InvoiceCreatorOption(id=row[0], full_name=row[1]) for row in rows]


def list_invoices(
    db: Session,
    *,
    created_by_id: UUID | None = None,
    status_filter: str | None = None,
) -> list[InvoiceListItem]:
    stmt = _invoice_query().order_by(Invoice.created_at.desc())
    if created_by_id is not None:
        stmt = stmt.where(Invoice.created_by_id == created_by_id)
    if status_filter:
        stmt = stmt.where(Invoice.status == status_filter)
    else:
        stmt = stmt.where(Invoice.status.in_(INVOICE_LIST_STATUSES))
    invoices = list(db.scalars(stmt))
    return [_to_list_item(inv) for inv in invoices]


def get_invoice(db: Session, invoice_id: UUID) -> InvoiceDetail:
    return _to_detail(_get_invoice_or_404(db, invoice_id))


def get_invoice_by_number(db: Session, number: str) -> InvoiceDetail:
    cleaned = number.strip().upper()
    invoice = db.scalar(_invoice_query().where(Invoice.number == cleaned))
    if invoice is None:
        raise AppError(
            "Invoice not found",
            code="invoice_not_found",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    return _to_detail(invoice)


def create_invoice(
    db: Session,
    payload: InvoiceCreate,
    *,
    created_by_id: UUID | None = None,
) -> InvoiceDetail:
    product_ids = [line.product_id for line in payload.lines]
    products = {
        p.id: p
        for p in db.scalars(select(Product).where(Product.id.in_(product_ids))).all()
    }
    missing = [str(pid) for pid in product_ids if pid not in products]
    if missing:
        raise AppError(
            "One or more products were not found",
            code="product_not_found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"product_ids": missing},
        )

    out_of_stock = [
        products[pid].name for pid in product_ids if not products[pid].in_stock
    ]
    if out_of_stock:
        raise AppError(
            "Only in-stock products can be added to an invoice.",
            code="product_out_of_stock",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"products": out_of_stock},
        )

    built_lines: list[InvoiceLine] = []
    subtotal = 0
    for index, item in enumerate(payload.lines):
        product = products[item.product_id]
        unit_price = (
            item.unit_price_pkr if item.unit_price_pkr is not None else product.price_pkr
        )
        line_total = unit_price * item.quantity
        subtotal += line_total
        built_lines.append(
            InvoiceLine(
                product_id=product.id,
                description=product.name,
                quantity=item.quantity,
                unit_price_pkr=unit_price,
                line_total_pkr=line_total,
                sort_order=index,
            )
        )

    discount = min(payload.discount_pkr, subtotal)
    total = subtotal - discount

    invoice = Invoice(
        number=_next_invoice_number(db),
        status=InvoiceStatus.ISSUED.value,
        customer_name=payload.customer_name.strip(),
        customer_phone=payload.customer_phone.strip() if payload.customer_phone else None,
        customer_email=str(payload.customer_email).lower() if payload.customer_email else None,
        notes=payload.notes.strip(),
        subtotal_pkr=subtotal,
        discount_pkr=discount,
        total_pkr=total,
        created_by_id=created_by_id,
        issued_at=datetime.now(UTC),
        lines=built_lines,
    )
    db.add(invoice)
    db.commit()
    return get_invoice(db, invoice.id)


def create_refund(
    db: Session,
    invoice_id: UUID,
    payload: RefundCreate,
    *,
    created_by_id: UUID | None = None,
) -> InvoiceDetail:
    invoice = _get_invoice_or_404(db, invoice_id)
    if invoice.status == InvoiceStatus.PENDING_DELETE.value:
        raise AppError(
            "Cannot refund an invoice that is pending deletion.",
            code="invoice_pending_delete",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    if invoice.status == InvoiceStatus.REFUNDED.value:
        raise AppError(
            "Invoice is already fully refunded.",
            code="invoice_already_refunded",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    remaining = invoice.total_pkr - _refunded_total(invoice)
    if payload.amount_pkr > remaining:
        raise AppError(
            f"Refund amount exceeds remaining balance ({remaining} PKR).",
            code="refund_exceeds_remaining",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"remaining_pkr": remaining},
        )

    refund = InvoiceRefund(
        number=_next_refund_number(db),
        invoice_id=invoice.id,
        amount_pkr=payload.amount_pkr,
        reason=payload.reason.strip(),
        status=RefundStatus.COMPLETED.value,
        created_by_id=created_by_id,
    )
    db.add(refund)
    db.flush()
    # Refresh refunds collection for status sync
    invoice.refunds.append(refund)
    _sync_invoice_refund_status(invoice)
    db.add(invoice)
    db.commit()
    return get_invoice(db, invoice.id)


def request_delete_invoice(db: Session, invoice_id: UUID) -> InvoiceDetail:
    """Admin (or super admin) moves an invoice into deletion review."""
    invoice = _get_invoice_or_404(db, invoice_id)
    if invoice.status == InvoiceStatus.PENDING_DELETE.value:
        return _to_detail(invoice)
    if invoice.status not in INVOICE_LIST_STATUSES:
        raise AppError(
            "Only active invoices can be sent for deletion review.",
            code="invoice_not_deletable",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    invoice.status = InvoiceStatus.PENDING_DELETE.value
    db.add(invoice)
    db.commit()
    return get_invoice(db, invoice.id)


def delete_invoice(db: Session, invoice_id: UUID) -> None:
    """Super admin permanently deletes an invoice (from review)."""
    invoice = _get_invoice_or_404(db, invoice_id)
    if invoice.status != InvoiceStatus.PENDING_DELETE.value:
        raise AppError(
            "Invoice must be in review before it can be permanently deleted.",
            code="invoice_not_in_review",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    db.delete(invoice)
    db.commit()


def invoice_count(db: Session) -> int:
    return int(
        db.scalar(
            select(func.count())
            .select_from(Invoice)
            .where(Invoice.status.in_(INVOICE_LIST_STATUSES))
        )
        or 0
    )
