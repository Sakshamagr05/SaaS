from sqlmodel import Field, Relationship

from src.models.base import BaseModel


class Consumer(BaseModel, table=True):
    __tablename__ = "consumers"

    account_id: int = Field(foreign_key="account.id", index=True)
    consumer_name: str = Field(index=True)
    contact_email: str | None = None
    phone: str | None = None
    address: str | None = None

    account: "Account" = Relationship(back_populates="consumers")