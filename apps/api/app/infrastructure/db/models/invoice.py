from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.models.enums import InvoiceStatus
from app.infrastructure.db.session import Base

if TYPE_CHECKING:
    from app.infrastructure.db.models.user import User


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    number: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), default=InvoiceStatus.ISSUED.value, nullable=False
    )
    customer_name: Mapped[str] = mapped_column(String(160), nullable=False)
    customer_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    subtotal_pkr: Mapped[int] = mapped_column(Integer, nullable=False)
    discount_pkr: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_pkr: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(32), default="cash", nullable=False)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    lines: Mapped[list[InvoiceLine]] = relationship(
        back_populates="invoice",
        cascade="all, delete-orphan",
        order_by="InvoiceLine.sort_order",
    )
    refunds: Mapped[list[InvoiceRefund]] = relationship(
        back_populates="invoice",
        cascade="all, delete-orphan",
        order_by="InvoiceRefund.created_at",
    )
    created_by: Mapped[User | None] = relationship("User", foreign_keys=[created_by_id])


class InvoiceLine(Base):
    __tablename__ = "invoice_lines"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    description: Mapped[str] = mapped_column(String(240), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price_pkr: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_cost_pkr: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    line_total_pkr: Mapped[int] = mapped_column(Integer, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    invoice: Mapped[Invoice] = relationship(back_populates="lines")


class InvoiceRefund(Base):
    """Refund against an issued invoice; tracked by REF-YYYY-#### and invoice number."""

    __tablename__ = "invoice_refunds"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    number: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    invoice_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount_pkr: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(Text, default="", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="completed", nullable=False)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    invoice: Mapped[Invoice] = relationship(back_populates="refunds")
    created_by: Mapped[User | None] = relationship("User", foreign_keys=[created_by_id])
