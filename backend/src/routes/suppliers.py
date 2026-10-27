
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.account import Account
from src.models.suppliers import Supplier
from src.schemas.suppliers import (
    SupplierCreate,
    SupplierRead,
    SupplierUpdate,
)

router = APIRouter(
    prefix="/accounts/{account_id}/suppliers",
    tags=["Suppliers"],
)


def get_supplier_or_404(
    account_id: int,
    supplier_id: int,
    session: Session,
):
    supplier = session.exec(
        select(Supplier).where(
            Supplier.id == supplier_id,
            Supplier.account_id == account_id,
        )
    ).first()

    if supplier is None:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    return supplier


# CREATE
@router.post("/", response_model=SupplierRead, status_code=201)
def create_supplier(
    account_id: int,
    data: SupplierCreate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    supplier = Supplier(
        account_id=account_id,
        **data.model_dump(),
    )

    try:
        session.add(supplier)
        session.commit()
        session.refresh(supplier)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not create supplier due to a database constraint",
        )

    return supplier


# READ ALL
@router.get("/", response_model=list[SupplierRead])
def get_suppliers(
    account_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = (
        select(Supplier)
        .where(Supplier.account_id == account_id)
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


# READ ONE
@router.get("/{supplier_id}", response_model=SupplierRead)
def get_supplier(
    account_id: int,
    supplier_id: int,
    session: Session = Depends(get_session),
):
    return get_supplier_or_404(
        account_id, supplier_id, session
    )


# UPDATE
@router.patch("/{supplier_id}", response_model=SupplierRead)
def update_supplier(
    account_id: int,
    supplier_id: int,
    data: SupplierUpdate,
    session: Session = Depends(get_session),
):
    supplier = get_supplier_or_404(
        account_id, supplier_id, session
    )

    changes = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    for key, value in changes.items():
        setattr(supplier, key, value)

    try:
        session.add(supplier)
        session.commit()
        session.refresh(supplier)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not update supplier due to a database constraint",
        )

    return supplier


# DELETE
@router.delete("/{supplier_id}", status_code=204)
def delete_supplier(
    account_id: int,
    supplier_id: int,
    session: Session = Depends(get_session),
):
    supplier = get_supplier_or_404(
        account_id, supplier_id, session
    )

    session.delete(supplier)
    session.commit()

    return None
