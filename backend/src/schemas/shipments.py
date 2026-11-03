from datetime import date
from typing import Literal

from sqlmodel import SQLModel, Field

from src.schemas.shipment_items import (
    ShipmentItemCreate,
    ShipmentItemRead,
)


class ShipmentCreate(SQLModel):
    supplier_id: int
    warehouse_id: int

    shipment_number: str = Field(
        min_length=1,
        max_length=50,
    )

    dispatch_date: date | None = None
    expected_arrival_date: date | None = None

    tracking_number: str | None = Field(
        default=None,
        max_length=100,
    )

    notes: str | None = None

    items: list[ShipmentItemCreate] = Field(
        min_length=1,
    )


class ShipmentRead(SQLModel):
    id: int
    supplier_id: int
    warehouse_id: int
    shipment_number: str
    dispatch_date: date | None
    expected_arrival_date: date | None
    actual_arrival_date: date | None
    status: str
    tracking_number: str | None
    notes: str | None
    items: list[ShipmentItemRead]


class ShipmentUpdate(SQLModel):
    supplier_id: int | None = None
    warehouse_id: int | None = None

    shipment_number: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    dispatch_date: date | None = None
    expected_arrival_date: date | None = None

    tracking_number: str | None = Field(
        default=None,
        max_length=100,
    )

    notes: str | None = None

