
from datetime import date
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship
from sqlalchemy import UniqueConstraint

from src.models.base import BaseModel

if TYPE_CHECKING:
    from src.models.suppliers import Supplier
    from src.models.warehouse import Warehouse
    from src.models.shipment_items import ShipmentItem


class Shipment(BaseModel, table=True):
    __tablename__ = "shipments"

    __table_args__ = (
        UniqueConstraint(
            "account_id",
            "shipment_number",
            name="uq_shipment_account_number",
        ),
    )

    account_id: int = Field(
        foreign_key="account.id",
        index=True,
    )

    supplier_id: int = Field(
        foreign_key="suppliers.id",
        index=True,
    )

    warehouse_id: int = Field(
        foreign_key="warehouses.id",
        index=True,
    )

    shipment_number: str = Field(max_length=50)

    dispatch_date: date | None = None
    expected_arrival_date: date | None = None
    actual_arrival_date: date | None = None

    status: str = Field(
        default="planned",
        max_length=30,
    )

    tracking_number: str | None = Field(
        default=None,
        max_length=100,
    )

    notes: str | None = None

    # One shipment -> multiple shipment items
    items: list["ShipmentItem"] = Relationship(
        back_populates="shipment",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan"
        },
    )

    # Many shipments -> one supplier
    supplier: "Supplier" = Relationship(
        back_populates="shipments"
    )

    # Many shipments -> one warehouse
    warehouse: "Warehouse" = Relationship(
        back_populates="shipments"
    )
