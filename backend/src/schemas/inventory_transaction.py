from datetime import datetime
from decimal import Decimal

from sqlmodel import SQLModel


class InventoryTransactionRead(SQLModel):
    id: int
    warehouse_id: int
    material_id: int
    transaction_type: str
    quantity_change: Decimal
    shipment_item_id: int | None
    notes: str | None
    created_at: datetime