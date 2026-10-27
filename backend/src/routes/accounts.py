from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.account import Account
from src.schemas.accounts import (
    AccountCreate,
    AccountRead,
    AccountUpdate,
)

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"],
)



# CREATE
@router.post("/", response_model=AccountRead, status_code=201)
def create_account(
    data: AccountCreate,
    session: Session = Depends(get_session),
):
    account = Account(**data.model_dump())

    try:
        session.add(account)
        session.commit()
        session.refresh(account)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="GST number or PAN number already exists",
        )

    return account


# READ ALL
@router.get("/", response_model=list[AccountRead])
def get_accounts(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    statement = (
        select(Account)
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


# READ ONE
@router.get("/{account_id}", response_model=AccountRead)
def get_account(
    account_id: int,
    session: Session = Depends(get_session),
):
    return get_account_or_404(account_id, session)


# UPDATE
@router.patch("/{account_id}", response_model=AccountRead)
def update_account(
    account_id: int,
    data: AccountUpdate,
    session: Session = Depends(get_session),
):
    account = get_account_or_404(account_id, session)

    changes = data.model_dump(exclude_unset=True)

    # Only PAN may explicitly be cleared with null.
    for key, value in changes.items():
        if value is None and key != "pan_no":
            raise HTTPException(
                status_code=422,
                detail=f"{key} cannot be null",
            )

        setattr(account, key, value)

    try:
        session.add(account)
        session.commit()
        session.refresh(account)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="GST number or PAN number already exists",
        )

    return account


# DELETE
@router.delete("/{account_id}", status_code=204)
def delete_account(
    account_id: int,
    session: Session = Depends(get_session),
):
    account = get_account_or_404(account_id, session)

    try:
        session.delete(account)
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Cannot delete account because related records exist. "
                "Handle dependent records before deleting this account."
            ),
        )

    return None
