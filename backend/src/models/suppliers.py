from sqlmodel import Field, Relationship

from src.models.base import BaseModel


class Supplier(BaseModel, table=True):
    __tablename__ = "suppliers"

    account_id: int = Field(foreign_key="account.id", index=True)
    supplier_name: str = Field(index=True)
    email: str | None = None
    phone: str | None = None
    address: str | None = None

    account: "Account" = Relationship(back_populates="suppliers")
