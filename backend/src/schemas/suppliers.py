
from sqlmodel import SQLModel, Field


class SupplierCreate(SQLModel):
    supplier_name: str = Field(min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class SupplierUpdate(SQLModel):
    supplier_name: str | None = Field(
        default=None, min_length=1, max_length=255
    )
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class SupplierRead(SQLModel):
    id: int
    account_id: int
    supplier_name: str
    email: str | None
    phone: str | None
    address: str | None
