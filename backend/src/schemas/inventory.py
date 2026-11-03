from decimal import Decimal
from typing import Literal

from sqlmodel import SQLModel, Field


class InventoryRead(SQLModel):
    id: int
    warehouse_id: int
    material_id: int
    quantity_on_hand: Decimal


class InventoryAdjustmentCreate(SQLModel):
    material_id: int
    warehouse_id: int
    adjustment_type: Literal["increase", "decrease"]
    quantity: Decimal = Field(gt=0, max_digits=15, decimal_places=3)
    notes: str | None = None