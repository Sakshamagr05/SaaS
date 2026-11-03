
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship
from sqlalchemy import Column, Numeric, UniqueConstraint

from src.models.base import BaseModel

if TYPE_CHECKING:
    from src.models.warehouse import Warehouse
    from src.models.materials import Material
    from src.models.shipment_items import ShipmentItem


class InventoryTransaction(BaseModel, table=True):
    __tablename__ = "inventory_transactions"

    __table_args__ = (
        UniqueConstraint(
            "shipment_item_id",
            name="uq_inventory_transaction_shipment_item",
        ),
    )

    account_id: int = Field(
        foreign_key="account.id",
        index=True,
    )

    warehouse_id: int = Field(
        foreign_key="warehouses.id",
        index=True,
    )

    material_id: int = Field(
        foreign_key="materials.id",
        index=True,
    )

    transaction_type: str = Field(
        max_length=30,
        index=True,
    )

    quantity_change: Decimal = Field(
        sa_column=Column(
            Numeric(15, 3),
            nullable=False,
        )
    )

    shipment_item_id: int | None = Field(
        default=None,
        foreign_key="shipment_items.id",
    )

    notes: str | None = None

    warehouse: "Warehouse" = Relationship()
    material: "Material" = Relationship()
    shipment_item: "ShipmentItem" = Relationship()
