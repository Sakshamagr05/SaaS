from typing import Any

from fastapi import HTTPException
from sqlmodel import Session, select


def get_account_resource_or_404(
    model: Any,
    account_id: int,
    resource_id: int,
    resource_name: str,
    session: Session,
):
    resource = session.exec(
        select(model).where(
            model.id == resource_id,
            model.account_id == account_id,
        )
    ).first()

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail=f"{resource_name} not found",
        )

    return resource
