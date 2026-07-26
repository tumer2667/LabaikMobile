"""create invoice tables

Revision ID: 20260726_0004
Revises: 20260726_0003
Create Date: 2026-07-26
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260726_0004"
down_revision: str | None = "20260726_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "invoices",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("number", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("customer_name", sa.String(length=160), nullable=False),
        sa.Column("customer_phone", sa.String(length=32), nullable=True),
        sa.Column("customer_email", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("subtotal_pkr", sa.Integer(), nullable=False),
        sa.Column("discount_pkr", sa.Integer(), nullable=False),
        sa.Column("total_pkr", sa.Integer(), nullable=False),
        sa.Column("created_by_id", sa.Uuid(), nullable=True),
        sa.Column(
            "issued_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_invoices_number"), "invoices", ["number"], unique=True)
    op.create_index(op.f("ix_invoices_created_by_id"), "invoices", ["created_by_id"], unique=False)

    op.create_table(
        "invoice_lines",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("invoice_id", sa.Uuid(), nullable=False),
        sa.Column("product_id", sa.Uuid(), nullable=True),
        sa.Column("description", sa.String(length=240), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price_pkr", sa.Integer(), nullable=False),
        sa.Column("line_total_pkr", sa.Integer(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_invoice_lines_invoice_id"), "invoice_lines", ["invoice_id"], unique=False)
    op.create_index(op.f("ix_invoice_lines_product_id"), "invoice_lines", ["product_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_invoice_lines_product_id"), table_name="invoice_lines")
    op.drop_index(op.f("ix_invoice_lines_invoice_id"), table_name="invoice_lines")
    op.drop_table("invoice_lines")
    op.drop_index(op.f("ix_invoices_created_by_id"), table_name="invoices")
    op.drop_index(op.f("ix_invoices_number"), table_name="invoices")
    op.drop_table("invoices")
