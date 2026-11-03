
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from src.database import get_session
from src.dependencies import get_account_or_404
from src.models.account import Account
from src.models.suppliers import Supplier
from src.models.materials import Material
from src.models.purchase_order import PurchaseOrder
from src.models.purchase_order_items import PurchaseOrderItem
from src.schemas.purchase_orders import (
    PurchaseOrderCreate,
    PurchaseOrderRead,
    PurchaseOrderUpdate,
)

router = APIRouter(
    prefix="/accounts/{account_id}/purchase-orders",
    tags=["Purchase Orders"],
)


@router.post(
    "/",
    response_model=PurchaseOrderRead,
    status_code=status.HTTP_201_CREATED,
)
def create_purchase_order(
    account_id: int,
    data: PurchaseOrderCreate,
    session: Session = Depends(get_session),
):
    # 1. Validate account
    get_account_or_404(account_id, session)

    # 2. Validate supplier belongs to this account
    supplier = session.exec(
        select(Supplier).where(
            Supplier.id == data.supplier_id,
            Supplier.account_id == account_id,
        )
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found in this account",
        )

    # 3. Validate all materials belong to this account
    material_ids = {item.material_id for item in data.items}

    materials = session.exec(
        select(Material.id).where(
            Material.id.in_(material_ids),
            Material.account_id == account_id,
        )
    ).all()

    if set(materials) != material_ids:
        raise HTTPException(
            status_code=404,
            detail="One or more materials were not found in this account",
        )

    # 4. Create purchase order and its items
    purchase_order = PurchaseOrder(
        account_id=account_id,
        supplier_id=data.supplier_id,
        order_number=data.order_number,
        order_date=data.order_date,
        expected_delivery_date=data.expected_delivery_date,
        notes=data.notes,
        items=[
            PurchaseOrderItem(
                material_id=item.material_id,
                ordered_quantity=item.ordered_quantity,
                unit=item.unit,
                unit_price=item.unit_price,
            )
            for item in data.items
        ],
    )

    try:
        session.add(purchase_order)
        session.commit()

        # Reload the order with its items
        statement = (
            select(PurchaseOrder)
            .where(PurchaseOrder.id == purchase_order.id)
            .options(selectinload(PurchaseOrder.items))
        )
        purchase_order = session.exec(statement).one()

        return purchase_order

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Purchase order number already exists in this account",
        )

    except Exception:
        session.rollback()
        raise


@router.get(
    "/",
    response_model=list[PurchaseOrderRead],
)
def get_purchase_orders(
    account_id: int,
    session: Session = Depends(get_session),
):
    # 1. Validate account
    get_account_or_404(account_id, session)

    # 2. Fetch all orders belonging to this account
    statement = (
        select(PurchaseOrder)
        .where(PurchaseOrder.account_id == account_id)
        .options(selectinload(PurchaseOrder.items))
        .order_by(PurchaseOrder.created_at.desc())
    )

    purchase_orders = session.exec(statement).all()

    return purchase_orders


@router.get(
    "/{order_id}",
    response_model=PurchaseOrderRead,
)
def get_purchase_order(
    account_id: int,
    order_id: int,
    session: Session = Depends(get_session),
):
    # 1. Validate account
    get_account_or_404(account_id, session)

    # 2. Fetch order with its items
    statement = (
        select(PurchaseOrder)
        .where(
            PurchaseOrder.id == order_id,
            PurchaseOrder.account_id == account_id,
        )
        .options(selectinload(PurchaseOrder.items))
    )

    purchase_order = session.exec(statement).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found",
        )

    return purchase_order


@router.patch(
    "/{order_id}",
    response_model=PurchaseOrderRead,
)
def update_purchase_order(
    account_id: int,
    order_id: int,
    data: PurchaseOrderUpdate,
    session: Session = Depends(get_session),
):
    # 1. Validate account
    get_account_or_404(account_id, session)

    # 2. Find purchase order belonging to this account
    statement = (
        select(PurchaseOrder)
        .where(
            PurchaseOrder.id == order_id,
            PurchaseOrder.account_id == account_id,
        )
        .options(selectinload(PurchaseOrder.items))
    )

    purchase_order = session.exec(statement).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found",
        )

    # 3. Validate new supplier if supplier_id is provided
    if data.supplier_id is not None:
        supplier = session.exec(
            select(Supplier).where(
                Supplier.id == data.supplier_id,
                Supplier.account_id == account_id,
            )
        ).first()

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found in this account",
            )

    # 4. Extract only fields provided by the user
    changes = data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    # 5. Update fields
    for key, value in changes.items():
        setattr(purchase_order, key, value)

    try:
        session.add(purchase_order)
        session.commit()
        session.refresh(purchase_order)

        # Reload items for the response
        statement = (
            select(PurchaseOrder)
            .where(PurchaseOrder.id == order_id)
            .options(selectinload(PurchaseOrder.items))
        )

        return session.exec(statement).one()

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Purchase order number already exists in this account",
        )

    except Exception:
        session.rollback()
        raise


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_purchase_order(
    account_id: int,
    order_id: int,
    session: Session = Depends(get_session),
):
    # 1. Validate account
    get_account_or_404(account_id, session)

    # 2. Find purchase order with its items
    statement = (
        select(PurchaseOrder)
        .where(
            PurchaseOrder.id == order_id,
            PurchaseOrder.account_id == account_id,
        )
        .options(selectinload(PurchaseOrder.items))
    )

    purchase_order = session.exec(statement).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found",
        )

    try:
        session.delete(purchase_order)
        session.commit()

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Cannot delete purchase order because it is referenced by other records",
        )

    except Exception:
        session.rollback()
        raise
