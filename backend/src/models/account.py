from sqlmodel import Field, Relationship

from src.models.base import BaseModel


class Account(BaseModel, table=True):
    __tablename__ = "account"

    company_name: str = Field(index=True)
    company_address: str
    gst_no: str = Field(unique=True, index=True)
    pan_no: str | None = Field(default=None, unique=True)

    users: list["UserDetail"] = Relationship(back_populates="account")
    suppliers: list["Supplier"] = Relationship(back_populates="account")
    consumers: list["Consumer"] = Relationship(back_populates="account")
    materials: list["Material"] = Relationship(back_populates="account")