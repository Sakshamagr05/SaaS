from typing import Any

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, SQLModel, select


def create_resource(
    *,
    model: type[SQLModel],
    account_id: int,
    data: dict[str, Any],
    session: Session,
    conflict_detail: str,
):
    resource = model(
        account_id=account_id,
        **data,
    )

    try:
        session.add(resource)
        session.commit()
        session.refresh(resource)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail=conflict_detail,
        )

    return resource


def list_resources(
    *,
    model: type[SQLModel],
    account_id: int,
    session: Session,
    offset: int = 0,
    limit: int = 100,
):
    statement = (
        select(model)
        .where(model.account_id == account_id)
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


def get_resource_or_404(
    *,
    model: type[SQLModel],
    account_id: int,
    resource_id: int,
    resource_name: str,
    session: Session,
):
    statement = select(model).where(
        model.id == resource_id,
        model.account_id == account_id,
    )

    resource = session.exec(statement).first()

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail=f"{resource_name} not found",
        )

    return resource


def update_resource(
    *,
    resource: Any,
    changes: dict[str, Any],
    session: Session,
    conflict_detail: str,
):
    for key, value in changes.items():
        setattr(resource, key, value)

    try:
        session.add(resource)
        session.commit()
        session.refresh(resource)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail=conflict_detail,
        )

    return resource


def delete_resource(
    *,
    resource: Any,
    session: Session,
    conflict_detail: str = (
        "Cannot delete resource because related records exist"
    ),
):
    try:
        session.delete(resource)
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail=conflict_detail,
        )
