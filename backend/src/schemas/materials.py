
from decimal import Decimal

from sqlmodel import SQLModel, Field


class MaterialCreate(SQLModel):
    material_name: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=100)
    unit: str = Field(default="pcs", min_length=1, max_length=30)
    unit_cost: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        max_digits=12,
        decimal_places=2,
    )


class MaterialUpdate(SQLModel):
    material_name: str | None = Field(
        default=None, min_length=1, max_length=255
    )
    sku: str | None = Field(
        default=None, min_length=1, max_length=100
    )
    unit: str | None = Field(
        default=None, min_length=1, max_length=30
    )
    unit_cost: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )


class MaterialRead(SQLModel):
    id: int
    account_id: int
    material_name: str
    sku: str
    unit: str
    unit_cost: Decimal
