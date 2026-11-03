
from decimal import Decimal

from sqlmodel import SQLModel, Field


class PurchaseOrderItemCreate(SQLModel):
    material_id: int
    ordered_quantity: Decimal = Field(gt=0, max_digits=15, decimal_places=3)
    unit: str = Field(min_length=1, max_length=20)
    unit_price: Decimal = Field(ge=0, max_digits=15, decimal_places=2)


class PurchaseOrderItemRead(SQLModel):
    id: int
    material_id: int
    ordered_quantity: Decimal
    unit: str
    unit_price: Decimal
