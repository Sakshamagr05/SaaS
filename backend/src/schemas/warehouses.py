
from sqlmodel import SQLModel, Field


class WarehouseCreate(SQLModel):
    warehouse_name: str = Field(
        min_length=1,
        max_length=255,
    )

    warehouse_code: str = Field(
        min_length=1,
        max_length=50,
    )

    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None

    is_active: bool = True


class WarehouseUpdate(SQLModel):
    warehouse_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    warehouse_code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None

    is_active: bool | None = None


class WarehouseRead(SQLModel):
    id: int
    account_id: int

    warehouse_name: str
    warehouse_code: str

    address: str | None
    city: str | None
    state: str | None
    pincode: str | None

    is_active: bool
