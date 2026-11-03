from decimal import Decimal

from sqlmodel import SQLModel, Field


class ShipmentItemCreate(SQLModel):
    purchase_order_item_id: int

    shipped_quantity: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=3,
    )


class ShipmentItemRead(SQLModel):
    id: int
    purchase_order_item_id: int
    shipped_quantity: Decimal
    received_quantity: Decimal
