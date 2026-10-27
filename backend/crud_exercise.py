
from sqlmodel import Session, select

from src.database import engine
from src.models import Account, Supplier, Material, Consumer


# 1. READ: Get suppliers for a particular account
def get_suppliers_by_account(account_id: int):
    with Session(engine) as session:
        statement = select(Supplier).where(
            Supplier.account_id == account_id
        )

        suppliers = session.exec(statement).all()

        print(f"\nSuppliers for Account ID {account_id}:")

        for supplier in suppliers:
            print(supplier.id, supplier.supplier_name)


# 2. UPDATE: Change a material's unit cost
def update_material_cost(material_id: int, new_cost: float):
    with Session(engine) as session:
        material = session.get(Material, material_id)

        if material is None:
            print("Material not found.")
            return

        print("Old cost:", material.unit_cost)

        material.unit_cost = new_cost

        session.add(material)
        session.commit()
        session.refresh(material)

        print("Updated cost:", material.unit_cost)


# 3. DELETE: Remove a test consumer record
def delete_test_consumer(consumer_id: int):
    with Session(engine) as session:
        consumer = session.get(Consumer, consumer_id)

        if consumer is None:
            print("Consumer not found.")
            return

        print("Deleting consumer:", consumer.consumer_name)

        session.delete(consumer)
        session.commit()

        print("Test consumer deleted successfully.")


if __name__ == "__main__":
    # Replace these IDs with IDs from your database.
    get_suppliers_by_account(account_id=1)

    update_material_cost(material_id=1, new_cost=82.50)

    # Uncomment only after confirming this is a test record.
    # delete_test_consumer(consumer_id=1)
