from sqlmodel import Field, Relationship

from src.models.base import BaseModel


class UserDetail(BaseModel, table=True):
    __tablename__ = "user_details"

    account_id: int = Field(foreign_key="account.id", index=True)
    name: str
    email: str = Field(unique=True, index=True)
    phone: str | None = None
    access_role: str = "employee"
    account: "Account" = Relationship(back_populates="users")