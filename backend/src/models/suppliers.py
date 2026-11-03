from sqlmodel import Field, Relationship
from typing import TYPE_CHECKING
from src.models.base import BaseModel

if TYPE_CHECKING:
    from src.models.purchase_order import PurchaseOrder
    from src.models.shipment import Shipment

class Supplier(BaseModel, table=True):
    __tablename__ = "suppliers"

    account_id: int = Field(foreign_key="account.id", index=True)
    supplier_name: str = Field(index=True)
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    account: "Account" = Relationship(back_populates="suppliers")
    purchase_orders: list["PurchaseOrder"] = Relationship(back_populates="supplier")
    shipments: list["Shipment"] = Relationship(back_populates="supplier")