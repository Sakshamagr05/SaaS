from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.warehouse import Warehouse
from src.schemas.warehouses import (
    WarehouseCreate,
    WarehouseRead,
    WarehouseUpdate,
)
from src.services.crud import (
    create_resource,
    list_resources,
    get_resource_or_404,
    update_resource,
    delete_resource,
)

router = APIRouter(
    prefix="/accounts/{account_id}/warehouses",
    tags=["Warehouses"],
)


# CREATE
@router.post("/", response_model=WarehouseRead, status_code=201)
def create_warehouse(
    account_id: int,
    data: WarehouseCreate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    return create_resource(
        model=Warehouse,
        account_id=account_id,
        data=data.model_dump(),
        session=session,
        conflict_detail=(
            "Warehouse code already exists for this account "
            "or a database constraint was violated"
        ),
    )


# READ ALL
@router.get("/", response_model=list[WarehouseRead])
def get_warehouses(
    account_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    return list_resources(
        model=Warehouse,
        account_id=account_id,
        session=session,
        offset=offset,
        limit=limit,
    )


# READ ONE
@router.get("/{warehouse_id}", response_model=WarehouseRead)
def get_warehouse(
    account_id: int,
    warehouse_id: int,
    session: Session = Depends(get_session),
):
    return get_resource_or_404(
        model=Warehouse,
        account_id=account_id,
        resource_id=warehouse_id,
        resource_name="Warehouse",
        session=session,
    )


# UPDATE
@router.patch("/{warehouse_id}", response_model=WarehouseRead)
def update_warehouse(
    account_id: int,
    warehouse_id: int,
    data: WarehouseUpdate,
    session: Session = Depends(get_session),
):
    warehouse = get_resource_or_404(
        model=Warehouse,
        account_id=account_id,
        resource_id=warehouse_id,
        resource_name="Warehouse",
        session=session,
    )

    return update_resource(
        resource=warehouse,
        changes=data.model_dump(
            exclude_unset=True,
        ),
        session=session,
        conflict_detail=(
            "Warehouse code already exists for this account "
            "or a database constraint was violated"
        ),
    )


# DELETE
@router.delete("/{warehouse_id}", status_code=204)
def delete_warehouse(
    account_id: int,
    warehouse_id: int,
    session: Session = Depends(get_session),
):
    warehouse = get_resource_or_404(
        model=Warehouse,
        account_id=account_id,
        resource_id=warehouse_id,
        resource_name="Warehouse",
        session=session,
    )

    delete_resource(
        resource=warehouse,
        session=session,
        conflict_detail=(
            "Cannot delete warehouse because related records exist"
        ),
    )

    return None
