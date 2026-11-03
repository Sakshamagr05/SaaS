
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from datetime import date
from decimal import Decimal

from src.database import get_session
from src.dependencies import get_account_or_404

from src.models.shipment import Shipment
from src.models.shipment_items import ShipmentItem
from src.models.purchase_order import PurchaseOrder
from src.models.purchase_order_items import PurchaseOrderItem
from src.models.suppliers import Supplier
from src.models.warehouse import Warehouse
from src.models.inventory import Inventory
from src.models.inventory_transaction import InventoryTransaction


from src.schemas.shipments import ShipmentCreate, ShipmentRead, ShipmentUpdate
from src.schemas.shipment_receiving import ShipmentReceive

router = APIRouter(
    prefix="/accounts/{account_id}/shipments",
    tags=["Shipments"],
)


@router.post(
    "/",
    response_model=ShipmentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_shipment(
    account_id: int,
    data: ShipmentCreate,
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

    # 3. Validate destination warehouse
    warehouse = session.exec(
        select(Warehouse).where(
            Warehouse.id == data.warehouse_id,
            Warehouse.account_id == account_id,
            Warehouse.is_active == True,
        )
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Active warehouse not found in this account",
        )

    # 4. Prevent duplicate purchase order item IDs
    item_ids = [
        item.purchase_order_item_id for item in data.items
    ]

    if len(item_ids) != len(set(item_ids)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate purchase order items are not allowed",
        )

    # 5. Fetch purchase order items and their parent orders
    statement = (
        select(PurchaseOrderItem, PurchaseOrder)
        .join(
            PurchaseOrder,
            PurchaseOrder.id == PurchaseOrderItem.purchase_order_id,
        )
        .where(
            PurchaseOrderItem.id.in_(item_ids),
            PurchaseOrder.account_id == account_id,
            PurchaseOrder.supplier_id == data.supplier_id,
        )
    )

    rows = session.exec(statement).all()

    if len(rows) != len(item_ids):
        raise HTTPException(
            status_code=404,
            detail=(
                "One or more purchase order items were not found "
                "for this account and supplier"
            ),
        )

    order_items = {
        order_item.id: (order_item, purchase_order)
        for order_item, purchase_order in rows
    }

    # 6. Check cumulative shipped quantities
    existing_rows = session.exec(
        select(
            ShipmentItem.purchase_order_item_id,
            func.sum(ShipmentItem.shipped_quantity),
        )
        .join(
            Shipment,
            Shipment.id == ShipmentItem.shipment_id,
        )
        .where(
            ShipmentItem.purchase_order_item_id.in_(item_ids),
            Shipment.status != "cancelled",
        )
        .group_by(ShipmentItem.purchase_order_item_id)
    ).all()

    already_shipped = {
        item_id: quantity
        for item_id, quantity in existing_rows
    }

    for requested_item in data.items:
        order_item, _ = order_items[
            requested_item.purchase_order_item_id
        ]

        previous_quantity = already_shipped.get(
            order_item.id, 0
        )

        total_shipped = (
            previous_quantity + requested_item.shipped_quantity
        )

        if total_shipped > order_item.ordered_quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Shipped quantity exceeds ordered quantity "
                    f"for purchase order item {order_item.id}. "
                    f"Ordered: {order_item.ordered_quantity}, "
                    f"already shipped: {previous_quantity}, "
                    f"requested: {requested_item.shipped_quantity}"
                ),
            )

    # 7. Create shipment with nested items
    shipment = Shipment(
        account_id=account_id,
        supplier_id=data.supplier_id,
        warehouse_id=data.warehouse_id,
        shipment_number=data.shipment_number,
        dispatch_date=data.dispatch_date,
        expected_arrival_date=data.expected_arrival_date,
        tracking_number=data.tracking_number,
        notes=data.notes,
        items=[
            ShipmentItem(
                purchase_order_item_id=item.purchase_order_item_id,
                shipped_quantity=item.shipped_quantity,
            )
            for item in data.items
        ],
    )

    try:
        session.add(shipment)
        session.commit()

        # 8. Reload shipment with its items
        statement = (
            select(Shipment)
            .where(Shipment.id == shipment.id)
            .options(selectinload(Shipment.items))
        )

        return session.exec(statement).one()

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Inventory transaction already exists for this shipment item",
        )

    except Exception:
        session.rollback()
        raise


@router.post(
    "/{shipment_id}/receive",
    response_model=ShipmentRead,
)
def receive_shipment(
    account_id: int,
    shipment_id: int,
    data: ShipmentReceive,
    session: Session = Depends(get_session),
):
    # 1. Validate account
    get_account_or_404(account_id, session)

    # 2. Fetch and lock shipment
    statement = (
        select(Shipment)
        .where(
            Shipment.id == shipment_id,
            Shipment.account_id == account_id,
        )
        .options(selectinload(Shipment.items))
        .with_for_update()
    )

    shipment = session.exec(statement).first()

    if not shipment:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found",
        )

    # 3. Prevent duplicate receiving
    if shipment.status == "delivered":
        raise HTTPException(
            status_code=409,
            detail="Shipment has already been received",
        )

    if shipment.status == "cancelled":
        raise HTTPException(
            status_code=409,
            detail="Cancelled shipments cannot be received",
        )

    # 4. Validate shipment item IDs
    requested_ids = [
        item.shipment_item_id for item in data.items
    ]

    if len(requested_ids) != len(set(requested_ids)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate shipment item IDs are not allowed",
        )

    existing_ids = {item.id for item in shipment.items}

    if set(requested_ids) != existing_ids:
        raise HTTPException(
            status_code=400,
            detail="Provide received quantities for every item in this shipment",
        )

    requested_items = {
        item.shipment_item_id: item
        for item in data.items
    }

    # 5. Validate received quantities
    for shipment_item in shipment.items:
        received = requested_items[
            shipment_item.id
        ].received_quantity

        if received > shipment_item.shipped_quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Received quantity cannot exceed shipped quantity "
                    f"for shipment item {shipment_item.id}"
                ),
            )

    try:
        # 6. Fetch related purchase order items
        po_item_ids = [
            item.purchase_order_item_id
            for item in shipment.items
        ]

        po_items = session.exec(
            select(PurchaseOrderItem)
            .join(
                PurchaseOrder,
                PurchaseOrder.id == PurchaseOrderItem.purchase_order_id,
            )
            .where(
                PurchaseOrderItem.id.in_(po_item_ids),
                PurchaseOrder.account_id == account_id,
                PurchaseOrder.supplier_id == shipment.supplier_id,
            )
        ).all()

        po_items_by_id = {
            item.id: item for item in po_items
        }

        if len(po_items_by_id) != len(po_item_ids):
            raise HTTPException(
                status_code=400,
                detail="A related purchase order item could not be found",
            )

        # 7. Update shipment items and inventory
        for shipment_item in shipment.items:
            received = requested_items[
                shipment_item.id
            ].received_quantity

            shipment_item.received_quantity = received
            session.add(shipment_item)

            # No stock change for zero received quantity
            if received == Decimal("0"):
                continue

            po_item = po_items_by_id[
                shipment_item.purchase_order_item_id
            ]

            # Find and lock inventory balance
            inventory = session.exec(
                select(Inventory)
                .where(
                    Inventory.account_id == account_id,
                    Inventory.warehouse_id == shipment.warehouse_id,
                    Inventory.material_id == po_item.material_id,
                )
                .with_for_update()
            ).first()

            # Create inventory row if it doesn't exist
            if not inventory:
                inventory = Inventory(
                    account_id=account_id,
                    warehouse_id=shipment.warehouse_id,
                    material_id=po_item.material_id,
                    quantity_on_hand=Decimal("0.000"),
                )
                session.add(inventory)
                session.flush()

            # Add actual received quantity
            inventory.quantity_on_hand += received
            session.add(inventory)

            # Record inventory transaction
            transaction = InventoryTransaction(
                account_id=account_id,
                warehouse_id=shipment.warehouse_id,
                material_id=po_item.material_id,
                transaction_type="purchase_receipt",
                quantity_change=received,
                shipment_item_id=shipment_item.id,
                notes=f"Stock received from shipment {shipment.shipment_number}",
            )

            session.add(transaction)

        # 8. Mark shipment as delivered
        shipment.status = "delivered"
        shipment.actual_arrival_date = date.today()

        session.add(shipment)

        # 9. Commit everything together
        session.commit()

        # 10. Reload shipment with items
        statement = (
            select(Shipment)
            .where(
                Shipment.id == shipment_id,
                Shipment.account_id == account_id,
            )
            .options(selectinload(Shipment.items))
        )

        return session.exec(statement).one()

    except Exception:
        session.rollback()
        raise

@router.get(
    "/",
    response_model=list[ShipmentRead],
)
def get_shipments(
    account_id: int,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = (
        select(Shipment)
        .where(Shipment.account_id == account_id)
        .options(selectinload(Shipment.items))
        .order_by(Shipment.created_at.desc())
    )

    return session.exec(statement).all()

@router.get(
    "/{shipment_id}",
    response_model=ShipmentRead,
)
def get_shipment(
    account_id: int,
    shipment_id: int,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = (
        select(Shipment)
        .where(
            Shipment.id == shipment_id,
            Shipment.account_id == account_id,
        )
        .options(selectinload(Shipment.items))
    )

    shipment = session.exec(statement).first()

    if not shipment:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found",
        )

    return shipment


@router.patch(
    "/{shipment_id}",
    response_model=ShipmentRead,
)
def update_shipment(
    account_id: int,
    shipment_id: int,
    data: ShipmentUpdate,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = (
        select(Shipment)
        .where(
            Shipment.id == shipment_id,
            Shipment.account_id == account_id,
        )
        .options(selectinload(Shipment.items))
    )

    shipment = session.exec(statement).first()

    if not shipment:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found",
        )

    # Delivered or cancelled shipments cannot be edited
    if shipment.status in ["delivered", "cancelled"]:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot update a {shipment.status} shipment",
        )

    changes = data.model_dump(exclude_unset=True)

    # Validate supplier if it is being changed
    if "supplier_id" in changes and changes["supplier_id"] is not None:
        supplier = session.exec(
            select(Supplier).where(
                Supplier.id == changes["supplier_id"],
                Supplier.account_id == account_id,
            )
        ).first()

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found in this account",
            )

        # Existing shipment items must still belong to this supplier
        for item in shipment.items:
            order_item = session.get(
                PurchaseOrderItem,
                item.purchase_order_item_id,
            )
            purchase_order = session.get(
                PurchaseOrder,
                order_item.purchase_order_id,
            )

            if purchase_order.supplier_id != changes["supplier_id"]:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Cannot change supplier because existing "
                        "shipment items belong to another supplier"
                    ),
                )

    # Validate warehouse if it is being changed
    if "warehouse_id" in changes and changes["warehouse_id"] is not None:
        warehouse = session.exec(
            select(Warehouse).where(
                Warehouse.id == changes["warehouse_id"],
                Warehouse.account_id == account_id,
                Warehouse.is_active == True,
            )
        ).first()

        if not warehouse:
            raise HTTPException(
                status_code=404,
                detail="Active warehouse not found in this account",
            )

    try:
        for key, value in changes.items():
            setattr(shipment, key, value)

        session.add(shipment)
        session.commit()

        statement = (
            select(Shipment)
            .where(Shipment.id == shipment_id)
            .options(selectinload(Shipment.items))
        )

        return session.exec(statement).one()

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Shipment number already exists in this account",
        )

    except Exception:
        session.rollback()
        raise


@router.delete(
    "/{shipment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_shipment(
    account_id: int,
    shipment_id: int,
    session: Session = Depends(get_session),
):
    get_account_or_404(account_id, session)

    statement = (
        select(Shipment)
        .where(
            Shipment.id == shipment_id,
            Shipment.account_id == account_id,
        )
        .options(selectinload(Shipment.items))
    )

    shipment = session.exec(statement).first()

    if not shipment:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found",
        )

    if shipment.status != "planned":
        raise HTTPException(
            status_code=409,
            detail=(
                "Only planned shipments can be deleted. "
                "Dispatched or delivered shipments must be retained."
            ),
        )

    try:
        session.delete(shipment)
        session.commit()

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Cannot delete shipment because it is referenced by other records",
        )

    except Exception:
        session.rollback()
        raise

