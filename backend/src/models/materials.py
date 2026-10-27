from decimal import Decimal

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship

from src.models.base import BaseModel


class Material(BaseModel, table=True):
    __tablename__ = "materials"

    __table_args__ = (
        UniqueConstraint(
            "account_id",
            "sku",
            name="uq_material_account_sku",
        ),
    )

    account_id: int = Field(foreign_key="account.id", index=True)
    material_name: str = Field(index=True)
    sku: str
    unit: str = "pcs"
    unit_cost: Decimal = Field(
        default=Decimal("0.00"),
        max_digits=12,
        decimal_places=2,
    )

    account: "Account" = Relationship(back_populates="materials")