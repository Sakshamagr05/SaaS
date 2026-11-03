
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.materials import Material
from src.schemas.materials import (
    MaterialCreate,
    MaterialRead,
    MaterialUpdate,
)
from src.services.crud import (
    create_resource,
    list_resources,
    get_resource_or_404,
    update_resource,
    delete_resource,
)

router = APIRouter(
    prefix="/accounts/{account_id}/materials",
    tags=["Materials"],
)


# CREATE
@router.post("/", response_model=MaterialRead, status_code=201)
def create_material(
    account_id: int,
    data: MaterialCreate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    return create_resource(
        model=Material,
        account_id=account_id,
        data=data.model_dump(),
        session=session,
        conflict_detail=(
            "Material SKU already exists for this account "
            "or a database constraint was violated"
        ),
    )


# READ ALL
@router.get("/", response_model=list[MaterialRead])
def get_materials(
    account_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    return list_resources(
        model=Material,
        account_id=account_id,
        session=session,
        offset=offset,
        limit=limit,
    )


# READ ONE
@router.get("/{material_id}", response_model=MaterialRead)
def get_material(
    account_id: int,
    material_id: int,
    session: Session = Depends(get_session),
):
    return get_resource_or_404(
        model=Material,
        account_id=account_id,
        resource_id=material_id,
        resource_name="Material",
        session=session,
    )


# UPDATE
@router.patch("/{material_id}", response_model=MaterialRead)
def update_material(
    account_id: int,
    material_id: int,
    data: MaterialUpdate,
    session: Session = Depends(get_session),
):
    material = get_resource_or_404(
        model=Material,
        account_id=account_id,
        resource_id=material_id,
        resource_name="Material",
        session=session,
    )

    return update_resource(
        resource=material,
        changes=data.model_dump(
            exclude_unset=True,
            exclude_none=True,
        ),
        session=session,
        conflict_detail=(
            "SKU already exists for this account "
            "or a database constraint was violated"
        ),
    )


# DELETE
@router.delete("/{material_id}", status_code=204)
def delete_material(
    account_id: int,
    material_id: int,
    session: Session = Depends(get_session),
):
    material = get_resource_or_404(
        model=Material,
        account_id=account_id,
        resource_id=material_id,
        resource_name="Material",
        session=session,
    )

    delete_resource(
        resource=material,
        session=session,
        conflict_detail=(
            "Cannot delete material because related records exist"
        ),
    )

    return None
