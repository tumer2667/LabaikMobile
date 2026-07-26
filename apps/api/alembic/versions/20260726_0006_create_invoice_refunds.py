"""create invoice_refunds

Revision ID: 20260726_0006
Revises: 20260726_0005
Create Date: 2026-07-26
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260726_0006"
down_revision: str | None = "20260726_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "invoice_refunds",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("number", sa.String(length=32), nullable=False),
        sa.Column("invoice_id", sa.Uuid(), nullable=False),
        sa.Column("amount_pkr", sa.Integer(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_by_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_invoice_refunds_number"), "invoice_refunds", ["number"], unique=True)
    op.create_index(
        op.f("ix_invoice_refunds_invoice_id"), "invoice_refunds", ["invoice_id"], unique=False
    )
    op.create_index(
        op.f("ix_invoice_refunds_created_by_id"),
        "invoice_refunds",
        ["created_by_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_invoice_refunds_created_by_id"), table_name="invoice_refunds")
    op.drop_index(op.f("ix_invoice_refunds_invoice_id"), table_name="invoice_refunds")
    op.drop_index(op.f("ix_invoice_refunds_number"), table_name="invoice_refunds")
    op.drop_table("invoice_refunds")
