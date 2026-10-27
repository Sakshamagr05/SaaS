from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.consumers import Consumer
from src.schemas.consumers import (
    ConsumerCreate,
    ConsumerRead,
    ConsumerUpdate,
)

router = APIRouter(
    prefix="/accounts/{account_id}/consumers",
    tags=["Consumers"],
)


def get_consumer_or_404(
    account_id: int,
    consumer_id: int,
    session: Session,
) -> Consumer:
    consumer = session.exec(
        select(Consumer).where(
            Consumer.id == consumer_id,
            Consumer.account_id == account_id,
        )
    ).first()

    if consumer is None:
        raise HTTPException(
            status_code=404,
            detail="Consumer not found",
        )

    return consumer


# CREATE
@router.post("/", response_model=ConsumerRead, status_code=201)
def create_consumer(
    account_id: int,
    data: ConsumerCreate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    consumer = Consumer(
        account_id=account_id,
        **data.model_dump(),
    )

    try:
        session.add(consumer)
        session.commit()
        session.refresh(consumer)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not create consumer due to a database constraint",
        )

    return consumer


# READ ALL
@router.get("/", response_model=list[ConsumerRead])
def get_consumers(
    account_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = (
        select(Consumer)
        .where(Consumer.account_id == account_id)
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


# READ ONE
@router.get("/{consumer_id}", response_model=ConsumerRead)
def get_consumer(
    account_id: int,
    consumer_id: int,
    session: Session = Depends(get_session),
):
    return get_consumer_or_404(
        account_id, consumer_id, session
    )


# UPDATE
@router.patch("/{consumer_id}", response_model=ConsumerRead)
def update_consumer(
    account_id: int,
    consumer_id: int,
    data: ConsumerUpdate,
    session: Session = Depends(get_session),
):
    consumer = get_consumer_or_404(
        account_id, consumer_id, session
    )

    changes = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    for key, value in changes.items():
        setattr(consumer, key, value)

    try:
        session.add(consumer)
        session.commit()
        session.refresh(consumer)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not update consumer due to a database constraint",
        )

    return consumer


# DELETE
@router.delete("/{consumer_id}", status_code=204)
def delete_consumer(
    account_id: int,
    consumer_id: int,
    session: Session = Depends(get_session),
):
    consumer = get_consumer_or_404(
        account_id, consumer_id, session
    )

    session.delete(consumer)
    session.commit()

    return None

