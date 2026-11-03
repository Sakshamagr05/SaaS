
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship
from sqlalchemy import Column, Numeric, UniqueConstraint

from src.models.base import BaseModel

if TYPE_CHECKING:
    from src.models.shipment import Shipment
    from src.models.purchase_order_items import PurchaseOrderItem


class ShipmentItem(BaseModel, table=True):
    __tablename__ = "shipment_items"

    __table_args__ = (
        UniqueConstraint(
            "shipment_id",
            "purchase_order_item_id",
            name="uq_shipment_purchase_order_item",
        ),
    )

    shipment_id: int = Field(
        foreign_key="shipments.id",
        index=True,
    )

    purchase_order_item_id: int = Field(
        foreign_key="purchase_order_items.id",
        index=True,
    )

    shipped_quantity: Decimal = Field(
        sa_column=Column(
            Numeric(15, 3),
            nullable=False,
        )
    )

    received_quantity: Decimal = Field(
        default=Decimal("0.000"),
        sa_column=Column(
            Numeric(15, 3),
            nullable=False,
        ),
    )

    # Many shipment items -> one shipment
    shipment: "Shipment" = Relationship(
        back_populates="items"
    )

    # Many shipment items -> one purchase order item
    purchase_order_item: "PurchaseOrderItem" = Relationship()
