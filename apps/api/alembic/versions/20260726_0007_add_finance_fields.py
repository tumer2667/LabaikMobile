"""add finance fields payment_method and costs

Revision ID: 20260726_0007
Revises: 20260726_0006
Create Date: 2026-07-26
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260726_0007"
down_revision: str | None = "20260726_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    product_cols = {c["name"] for c in inspector.get_columns("products")}
    if "cost_pkr" not in product_cols:
        with op.batch_alter_table("products") as batch_op:
            batch_op.add_column(
                sa.Column("cost_pkr", sa.Integer(), nullable=False, server_default="0")
            )

    invoice_cols = {c["name"] for c in inspector.get_columns("invoices")}
    if "payment_method" not in invoice_cols:
        with op.batch_alter_table("invoices") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "payment_method",
                    sa.String(length=32),
                    nullable=False,
                    server_default="cash",
                )
            )

    line_cols = {c["name"] for c in inspector.get_columns("invoice_lines")}
    if "unit_cost_pkr" not in line_cols:
        with op.batch_alter_table("invoice_lines") as batch_op:
            batch_op.add_column(
                sa.Column("unit_cost_pkr", sa.Integer(), nullable=False, server_default="0")
            )


def downgrade() -> None:
    with op.batch_alter_table("invoice_lines") as batch_op:
        batch_op.drop_column("unit_cost_pkr")
    with op.batch_alter_table("invoices") as batch_op:
        batch_op.drop_column("payment_method")
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_column("cost_pkr")
