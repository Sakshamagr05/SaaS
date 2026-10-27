
from datetime import datetime

from sqlmodel import SQLModel, Field


class AccountCreate(SQLModel):
    company_name: str = Field(min_length=1, max_length=255)
    company_address: str = Field(min_length=1, max_length=500)
    gst_no: str = Field(min_length=1, max_length=15)
    pan_no: str | None = Field(default=None, max_length=10)


class AccountUpdate(SQLModel):
    company_name: str | None = Field(
        default=None, min_length=1, max_length=255
    )
    company_address: str | None = Field(
        default=None, min_length=1, max_length=500
    )
    gst_no: str | None = Field(
        default=None, min_length=1, max_length=15
    )
    pan_no: str | None = Field(default=None, max_length=10)


class AccountRead(SQLModel):
    id: int
    company_name: str
    company_address: str
    gst_no: str
    pan_no: str | None
    created_at: datetime
    updated_at: datetime
