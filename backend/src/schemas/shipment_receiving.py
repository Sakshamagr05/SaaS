
from decimal import Decimal

from sqlmodel import SQLModel, Field


class ShipmentItemReceive(SQLModel):
    shipment_item_id: int

    received_quantity: Decimal = Field(
        ge=0,
        max_digits=15,
        decimal_places=3,
    )


class ShipmentReceive(SQLModel):
    items: list[ShipmentItemReceive] = Field(min_length=1)
