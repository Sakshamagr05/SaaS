from sqlalchemy import URL
from sqlmodel import Session, create_engine

from src.core.secrets import get_database_secret


secret = get_database_secret()

database_url = URL.create(
    drivername="mysql+pymysql",
    username=secret["DB_USERNAME"],
    password=secret["DB_PASSWORD"],
    host=secret["DB_HOST"],
    port=int(secret["DB_PORT"]),
    database=secret["DB_NAME"],
)

engine = create_engine(
    database_url,
    pool_pre_ping=True,
)


def get_session():
    with Session(engine) as session:
        yield session
