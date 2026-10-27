
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.account import Account
from src.models.materials import Material
from src.schemas.materials import (
    MaterialCreate,
    MaterialRead,
    MaterialUpdate,
)

router = APIRouter(
    prefix="/accounts/{account_id}/materials",
    tags=["Materials"],
)


def get_material_or_404(
    account_id: int,
    material_id: int,
    session: Session,
):
    material = session.exec(
        select(Material).where(
            Material.id == material_id,
            Material.account_id == account_id,
        )
    ).first()

    if material is None:
        raise HTTPException(
            status_code=404,
            detail="Material not found",
        )

    return material


# CREATE
@router.post("/", response_model=MaterialRead, status_code=201)
def create_material(
    account_id: int,
    data: MaterialCreate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    material = Material(
        account_id=account_id,
        **data.model_dump(),
    )

    try:
        session.add(material)
        session.commit()
        session.refresh(material)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Material SKU already exists for this account "
                   "or a database constraint was violated",
        )

    return material


# READ ALL
@router.get("/", response_model=list[MaterialRead])
def get_materials(
    account_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = (
        select(Material)
        .where(Material.account_id == account_id)
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()


# READ ONE
@router.get("/{material_id}", response_model=MaterialRead)
def get_material(
    account_id: int,
    material_id: int,
    session: Session = Depends(get_session),
):
    return get_material_or_404(
        account_id, material_id, session
    )


# UPDATE
@router.patch("/{material_id}", response_model=MaterialRead)
def update_material(
    account_id: int,
    material_id: int,
    data: MaterialUpdate,
    session: Session = Depends(get_session),
):
    material = get_material_or_404(
        account_id, material_id, session
    )

    changes = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    for key, value in changes.items():
        setattr(material, key, value)

    try:
        session.add(material)
        session.commit()
        session.refresh(material)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="SKU already exists for this account "
                   "or a database constraint was violated",
        )

    return material


# DELETE
@router.delete("/{material_id}", status_code=204)
def delete_material(
    account_id: int,
    material_id: int,
    session: Session = Depends(get_session),
):
    material = get_material_or_404(
        account_id, material_id, session
    )

    session.delete(material)
    session.commit()

    return None
