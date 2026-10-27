from sqlmodel import SQLModel

from src.database import engine
from src.models import (
    Account,
    UserDetail,
    Supplier,
    Consumer,
    Material,
)

SQLModel.metadata.create_all(engine)

print("All tables created successfully!")