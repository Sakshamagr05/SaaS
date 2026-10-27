
from sqlalchemy import text

from src.database import engine

with engine.connect() as connection:
    version = connection.execute(
        text("SELECT VERSION()")
    ).scalar()

    database = connection.execute(
        text("SELECT DATABASE()")
    ).scalar()

    print("Connected successfully!")
    print("MySQL version:", version)
    print("Database:", database)
