from sqlmodel import SQLModel, Field


class ConsumerCreate(SQLModel):
    consumer_name: str = Field(min_length=1, max_length=255)
    contact_email: str | None = None
    phone: str | None = None
    address: str | None = None


class ConsumerUpdate(SQLModel):
    consumer_name: str | None = Field(
        default=None, min_length=1, max_length=255
    )
    contact_email: str | None = None
    phone: str | None = None
    address: str | None = None


class ConsumerRead(SQLModel):
    id: int
    account_id: int
    consumer_name: str
    contact_email: str | None
    phone: str | None
    address: str | None
