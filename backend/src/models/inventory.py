
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship
from sqlalchemy import Column, Numeric, UniqueConstraint

from src.models.base import BaseModel

if TYPE_CHECKING:
    from src.models.warehouse import Warehouse
    from src.models.materials import Material


class Inventory(BaseModel, table=True):
    __tablename__ = "inventory"

    __table_args__ = (
        UniqueConstraint(
            "warehouse_id",
            "material_id",
            name="uq_inventory_warehouse_material",
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

    quantity_on_hand: Decimal = Field(
        default=Decimal("0.000"),
        sa_column=Column(
            Numeric(15, 3),
            nullable=False,
            default=Decimal("0.000"),
        ),
    )

    warehouse: "Warehouse" = Relationship()
    material: "Material" = Relationship()
