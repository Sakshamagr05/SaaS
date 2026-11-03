from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.consumers import Consumer
from src.schemas.consumers import (
    ConsumerCreate,
    ConsumerRead,
    ConsumerUpdate,
)
from src.services.crud import (
    create_resource,
    list_resources,
    get_resource_or_404,
    update_resource,
    delete_resource,
)

router = APIRouter(
    prefix="/accounts/{account_id}/consumers",
    tags=["Consumers"],
)


# CREATE
@router.post("/", response_model=ConsumerRead, status_code=201)
def create_consumer(
    account_id: int,
    data: ConsumerCreate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    return create_resource(
        model=Consumer,
        account_id=account_id,
        data=data.model_dump(),
        session=session,
        conflict_detail=(
            "Could not create consumer due to a database constraint"
        ),
    )


# READ ALL
@router.get("/", response_model=list[ConsumerRead])
def get_consumers(
    account_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    return list_resources(
        model=Consumer,
        account_id=account_id,
        session=session,
        offset=offset,
        limit=limit,
    )


# READ ONE
@router.get("/{consumer_id}", response_model=ConsumerRead)
def get_consumer(
    account_id: int,
    consumer_id: int,
    session: Session = Depends(get_session),
):
    return get_resource_or_404(
        model=Consumer,
        account_id=account_id,
        resource_id=consumer_id,
        resource_name="Consumer",
        session=session,
    )


# UPDATE
@router.patch("/{consumer_id}", response_model=ConsumerRead)
def update_consumer(
    account_id: int,
    consumer_id: int,
    data: ConsumerUpdate,
    session: Session = Depends(get_session),
):
    consumer = get_resource_or_404(
        model=Consumer,
        account_id=account_id,
        resource_id=consumer_id,
        resource_name="Consumer",
        session=session,
    )

    return update_resource(
        resource=consumer,
        changes=data.model_dump(
            exclude_unset=True,
            exclude_none=True,
        ),
        session=session,
        conflict_detail=(
            "Could not update consumer due to a database constraint"
        ),
    )


# DELETE
@router.delete("/{consumer_id}", status_code=204)
def delete_consumer(
    account_id: int,
    consumer_id: int,
    session: Session = Depends(get_session),
):
    consumer = get_resource_or_404(
        model=Consumer,
        account_id=account_id,
        resource_id=consumer_id,
        resource_name="Consumer",
        session=session,
    )

    delete_resource(
        resource=consumer,
        session=session,
        conflict_detail=(
            "Cannot delete consumer because related records exist"
        ),
    )

    return None
