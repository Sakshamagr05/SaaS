
from datetime import date
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship
from sqlalchemy import UniqueConstraint

from src.models.base import BaseModel

if TYPE_CHECKING:
    from src.models.suppliers import Supplier
    from src.models.purchase_order_items import PurchaseOrderItem


class PurchaseOrder(BaseModel, table=True):
    __tablename__ = "purchase_orders"

    __table_args__ = (
        UniqueConstraint(
            "account_id",
            "order_number",
            name="uq_purchase_order_account_number",
        ),
    )

    account_id: int = Field(
        foreign_key="account.id",
        index=True,
    )

    supplier_id: int = Field(
        foreign_key="suppliers.id",
        index=True,
    )

    order_number: str = Field(max_length=50)
    order_date: date
    expected_delivery_date: date | None = None

    status: str = Field(default="draft", max_length=30)
    notes: str | None = None

    # Relationship: one order -> multiple items
    items: list["PurchaseOrderItem"] = Relationship(
        back_populates="purchase_order",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    # Relationship: many orders -> one supplier
    supplier: "Supplier" = Relationship(
        back_populates="purchase_orders"
    )
