from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.suppliers import Supplier
from src.schemas.suppliers import (
    SupplierCreate,
    SupplierRead,
    SupplierUpdate,
)
from src.services.crud import (
    create_resource,
    list_resources,
    get_resource_or_404,
    update_resource,
    delete_resource,
)

router = APIRouter(
    prefix="/accounts/{account_id}/suppliers",
    tags=["Suppliers"],
)


# CREATE
@router.post("/", response_model=SupplierRead, status_code=201)
def create_supplier(
    account_id: int,
    data: SupplierCreate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    return create_resource(
        model=Supplier,
        account_id=account_id,
        data=data.model_dump(),
        session=session,
        conflict_detail=(
            "Could not create supplier due to a database constraint"
        ),
    )


# READ ALL
@router.get("/", response_model=list[SupplierRead])
def get_suppliers(
    account_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    return list_resources(
        model=Supplier,
        account_id=account_id,
        session=session,
        offset=offset,
        limit=limit,
    )


# READ ONE
@router.get("/{supplier_id}", response_model=SupplierRead)
def get_supplier(
    account_id: int,
    supplier_id: int,
    session: Session = Depends(get_session),
):
    return get_resource_or_404(
        model=Supplier,
        account_id=account_id,
        resource_id=supplier_id,
        resource_name="Supplier",
        session=session,
    )


# UPDATE
@router.patch("/{supplier_id}", response_model=SupplierRead)
def update_supplier(
    account_id: int,
    supplier_id: int,
    data: SupplierUpdate,
    session: Session = Depends(get_session),
):
    supplier = get_resource_or_404(
        model=Supplier,
        account_id=account_id,
        resource_id=supplier_id,
        resource_name="Supplier",
        session=session,
    )

    return update_resource(
        resource=supplier,
        changes=data.model_dump(
            exclude_unset=True,
            exclude_none=True,
        ),
        session=session,
        conflict_detail=(
            "Could not update supplier due to a database constraint"
        ),
    )


# DELETE
@router.delete("/{supplier_id}", status_code=204)
def delete_supplier(
    account_id: int,
    supplier_id: int,
    session: Session = Depends(get_session),
):
    supplier = get_resource_or_404(
        model=Supplier,
        account_id=account_id,
        resource_id=supplier_id,
        resource_name="Supplier",
        session=session,
    )

    delete_resource(
        resource=supplier,
        session=session,
        conflict_detail=(
            "Cannot delete supplier because related records exist"
        ),
    )

    return None
