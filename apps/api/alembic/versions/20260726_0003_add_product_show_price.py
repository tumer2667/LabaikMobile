"""add product show_price

Revision ID: 20260726_0003
Revises: 20260724_0002
Create Date: 2026-07-26
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260726_0003"
down_revision: str | None = "20260724_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {c["name"] for c in inspector.get_columns("products")}

    if "show_price" not in columns:
        with op.batch_alter_table("products") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "show_price",
                    sa.Boolean(),
                    nullable=False,
                    # Use boolean true — Postgres rejects DEFAULT 1 for boolean columns.
                    server_default=sa.true(),
                )
            )

    # Preserve previous storefront behavior (category-level price visibility).
    op.execute(
        sa.text(
            """
            UPDATE products
            SET show_price = (
                SELECT categories.show_price
                FROM categories
                WHERE categories.id = products.category_id
            )
            WHERE EXISTS (
                SELECT 1
                FROM categories
                WHERE categories.id = products.category_id
            )
            """
        )
    )


def downgrade() -> None:
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_column("show_price")
