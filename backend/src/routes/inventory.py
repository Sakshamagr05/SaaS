from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from src.database import get_session
from src.dependencies import get_account_or_404

from src.models.inventory import Inventory
from src.models.inventory_transaction import InventoryTransaction
from src.models.warehouse import Warehouse
from src.models.materials import Material

from src.schemas.inventory import (
    InventoryRead,
    InventoryAdjustmentCreate,
)
from src.schemas.inventory_transaction import InventoryTransactionRead


router = APIRouter(
    prefix="/accounts/{account_id}/inventory",
    tags=["Inventory"],
)


# 1. Get all inventory for an account
@router.get("/", response_model=list[InventoryRead])
def get_inventory(
    account_id: int,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = (
        select(Inventory)
        .where(Inventory.account_id == account_id)
        .order_by(Inventory.id.desc())
    )

    return session.exec(statement).all()


# 2. Get inventory for a particular warehouse
@router.get(
    "/warehouses/{warehouse_id}",
    response_model=list[InventoryRead],
)
def get_warehouse_inventory(
    account_id: int,
    warehouse_id: int,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    warehouse = session.exec(
        select(Warehouse).where(
            Warehouse.id == warehouse_id,
            Warehouse.account_id == account_id,
        )
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found for this account",
        )

    statement = select(Inventory).where(
        Inventory.account_id == account_id,
        Inventory.warehouse_id == warehouse_id,
    )

    return session.exec(statement).all()


# 3. Manually increase or decrease inventory
@router.post("/adjustments", response_model=InventoryRead)
def adjust_inventory(
    account_id: int,
    data: InventoryAdjustmentCreate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    # Validate warehouse belongs to this account
    warehouse = session.exec(
        select(Warehouse).where(
            Warehouse.id == data.warehouse_id,
            Warehouse.account_id == account_id,
        )
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found for this account",
        )

    # Validate material belongs to this account
    material = session.exec(
        select(Material).where(
            Material.id == data.material_id,
            Material.account_id == account_id,
        )
    ).first()

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found for this account",
        )

    # Find and lock the inventory row
    inventory = session.exec(
        select(Inventory)
        .where(
            Inventory.account_id == account_id,
            Inventory.warehouse_id == data.warehouse_id,
            Inventory.material_id == data.material_id,
        )
        .with_for_update()
    ).first()

    quantity = data.quantity

    if data.adjustment_type == "increase":
        quantity_change = quantity
        transaction_type = "adjustment_increase"

        # Create inventory row if it doesn't exist
        if not inventory:
            inventory = Inventory(
                account_id=account_id,
                warehouse_id=data.warehouse_id,
                material_id=data.material_id,
                quantity_on_hand=Decimal("0.000"),
            )
            session.add(inventory)
            session.flush()

    else:
        quantity_change = -quantity
        transaction_type = "adjustment_decrease"

        if not inventory:
            raise HTTPException(
                status_code=400,
                detail="Insufficient stock",
            )

        if inventory.quantity_on_hand < quantity:
            raise HTTPException(
                status_code=400,
                detail="Adjustment quantity exceeds available stock",
            )

    # Update inventory balance
    inventory.quantity_on_hand += quantity_change

    # Create audit transaction
    transaction = InventoryTransaction(
        account_id=account_id,
        warehouse_id=data.warehouse_id,
        material_id=data.material_id,
        transaction_type=transaction_type,
        quantity_change=quantity_change,
        shipment_item_id=None,
        notes=data.notes,
    )

    session.add(transaction)

    try:
        session.commit()
        session.refresh(inventory)
        return inventory

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Inventory update conflict. Please retry.",
        )


# 4. Get inventory transaction history
@router.get(
    "/transactions",
    response_model=list[InventoryTransactionRead],
)
def get_inventory_transactions(
    account_id: int,
    warehouse_id: int | None = None,
    material_id: int | None = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = select(InventoryTransaction).where(
        InventoryTransaction.account_id == account_id
    )

    if warehouse_id is not None:
        statement = statement.where(
            InventoryTransaction.warehouse_id == warehouse_id
        )

    if material_id is not None:
        statement = statement.where(
            InventoryTransaction.material_id == material_id
        )

    statement = (
        statement
        .order_by(InventoryTransaction.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    return session.exec(statement).all()