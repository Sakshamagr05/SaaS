
from datetime import date
from typing import Literal

from sqlmodel import SQLModel, Field

from src.schemas.purchase_order_items import (
    PurchaseOrderItemCreate,
    PurchaseOrderItemRead,
)


class PurchaseOrderCreate(SQLModel):
    supplier_id: int
    order_number: str = Field(min_length=1, max_length=50)
    order_date: date
    expected_delivery_date: date | None = None
    notes: str | None = None

    items: list[PurchaseOrderItemCreate] = Field(min_length=1)


class PurchaseOrderUpdate(SQLModel):
    supplier_id: int | None = None
    order_number: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    order_date: date | None = None
    expected_delivery_date: date | None = None
    status: Literal[
        "draft",
        "submitted",
        "partially_received",
        "completed",
        "cancelled",
    ] | None = None
    notes: str | None = None


class PurchaseOrderRead(SQLModel):
    id: int
    supplier_id: int
    order_number: str
    order_date: date
    expected_delivery_date: date | None
    status: str
    notes: str | None
    items: list[PurchaseOrderItemRead]
