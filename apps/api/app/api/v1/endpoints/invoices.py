from uuid import UUID

from fastapi import APIRouter, Query

from app.api.v1.deps import AdminUser, DbSession, SuperAdminUser
from app.application.invoices import service as invoices
from app.domain.models.enums import INVOICE_LIST_STATUSES, InvoiceStatus
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceCreatorOption,
    InvoiceDetail,
    InvoiceListItem,
    RefundCreate,
)

router = APIRouter(prefix="/admin")


@router.get("/invoices/creators", response_model=list[InvoiceCreatorOption])
def list_invoice_creators(_admin: AdminUser, db: DbSession) -> list[InvoiceCreatorOption]:
    return invoices.list_invoice_creators(db)


@router.get("/invoices", response_model=list[InvoiceListItem])
def list_invoices(
    _admin: AdminUser,
    db: DbSession,
    created_by: UUID | None = Query(default=None),
    status: str | None = Query(default=None),
) -> list[InvoiceListItem]:
    status_filter = None
    allowed = set(INVOICE_LIST_STATUSES) | {InvoiceStatus.PENDING_DELETE.value}
    if status in allowed:
        status_filter = status
    return invoices.list_invoices(db, created_by_id=created_by, status_filter=status_filter)


@router.post("/invoices", response_model=InvoiceDetail, status_code=201)
def create_invoice(
    payload: InvoiceCreate, admin: AdminUser, db: DbSession
) -> InvoiceDetail:
    return invoices.create_invoice(db, payload, created_by_id=admin.id)


@router.get("/invoices/by-number/{number}", response_model=InvoiceDetail)
def get_invoice_by_number(number: str, _admin: AdminUser, db: DbSession) -> InvoiceDetail:
    return invoices.get_invoice_by_number(db, number)


@router.get("/invoices/{invoice_id}", response_model=InvoiceDetail)
def get_invoice(invoice_id: UUID, _admin: AdminUser, db: DbSession) -> InvoiceDetail:
    return invoices.get_invoice(db, invoice_id)


@router.post("/invoices/{invoice_id}/refunds", response_model=InvoiceDetail, status_code=201)
def create_refund(
    invoice_id: UUID,
    payload: RefundCreate,
    admin: AdminUser,
    db: DbSession,
) -> InvoiceDetail:
    return invoices.create_refund(db, invoice_id, payload, created_by_id=admin.id)


@router.post("/invoices/{invoice_id}/request-delete", response_model=InvoiceDetail)
def request_delete_invoice(
    invoice_id: UUID, _admin: AdminUser, db: DbSession
) -> InvoiceDetail:
    return invoices.request_delete_invoice(db, invoice_id)


@router.delete("/invoices/{invoice_id}", status_code=204)
def delete_invoice(
    invoice_id: UUID, _super: SuperAdminUser, db: DbSession
) -> None:
    invoices.delete_invoice(db, invoice_id)
