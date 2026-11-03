
from sqlmodel import Field
from sqlalchemy import UniqueConstraint

from src.models.base import BaseModel
from typing import TYPE_CHECKING
from sqlmodel import Relationship

if TYPE_CHECKING:
    from src.models.shipment import Shipment


class Warehouse(BaseModel, table=True):
    __tablename__ = "warehouses"

    __table_args__ = (
        UniqueConstraint(
            "account_id",
            "warehouse_code",
            name="uq_warehouse_account_code",
        ),
    )

    account_id: int = Field(
        foreign_key="account.id",
        index=True,
    )

    warehouse_name: str = Field(max_length=255)

    warehouse_code: str = Field(max_length=50)

    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None

    is_active: bool = True
    shipments: list["Shipment"] = Relationship(back_populates="warehouse")
