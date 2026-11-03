
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship
from sqlalchemy import Column, Numeric

from src.models.base import BaseModel

if TYPE_CHECKING:
    from src.models.purchase_order import PurchaseOrder
    from src.models.materials import Material


class PurchaseOrderItem(BaseModel, table=True):
    __tablename__ = "purchase_order_items"

    purchase_order_id: int = Field(
        foreign_key="purchase_orders.id",
        index=True,
    )

    material_id: int = Field(
        foreign_key="materials.id",
        index=True,
    )

    ordered_quantity: Decimal = Field(
        sa_column=Column(Numeric(15, 3), nullable=False)
    )

    unit: str = Field(max_length=20)

    unit_price: Decimal = Field(
        sa_column=Column(Numeric(15, 2), nullable=False)
    )

    # Relationship: many items -> one purchase order
    purchase_order: "PurchaseOrder" = Relationship(
        back_populates="items"
    )

    # Relationship: many order items -> one material
    material: "Material" = Relationship()
