from decimal import Decimal

from sqlmodel import Session, select

from src.database import engine
from src.models import (
    Account,
    UserDetail,
    Supplier,
    Consumer,
    Material,
)


def seed_database():
    with Session(engine) as session:

        # 1. Create a manufacturing business
        account = Account(
            company_name="ABC Manufacturing",
            company_address="Gorakhpur, Uttar Pradesh",
            gst_no="TESTGST0000001",
            pan_no=None,
        )

        session.add(account)
        session.commit()
        session.refresh(account)

        print("Account created:", account.id)

        # 2. Create a user belonging to this account
        user = UserDetail(
            account_id=account.id,
            name="Rahul Sharma",
            email="rahul@example.com",
            phone="9876543210",
            access_role="admin",
        )

        # 3. Create a supplier
        supplier = Supplier(
            account_id=account.id,
            supplier_name="Steel Suppliers Ltd",
            email="steel@example.com",
            phone="9876500001",
            address="Kanpur, Uttar Pradesh",
        )

        # 4. Create a customer
        consumer = Consumer(
            account_id=account.id,
            consumer_name="XYZ Industries",
            contact_email="purchase@xyz.example",
            phone="9876500002",
            address="Lucknow, Uttar Pradesh",
        )

        # 5. Create a raw material
        material = Material(
            account_id=account.id,
            material_name="Mild Steel Sheet",
            sku="MS-SHEET-001",
            unit="kg",
            unit_cost=Decimal("75.50"),
        )

        # Add all related objects to the session
        session.add_all([
            user,
            supplier,
            consumer,
            material,
        ])

        session.commit()

        print("User, supplier, consumer, and material created!")

        # 6. Retrieve saved data using ORM
        statement = select(Account).where(
            Account.id == account.id
        )
        saved_account = session.exec(statement).first()

        if saved_account:
            print("\nRetrieved account:")
            print("Company:", saved_account.company_name)
            print("ID:", saved_account.id)

            print("\nRelated records:")
            print("Users:", len(saved_account.users))
            print("Suppliers:", len(saved_account.suppliers))
            print("Consumers:", len(saved_account.consumers))
            print("Materials:", len(saved_account.materials))

            for item in saved_account.materials:
                print(
                    "Material:",
                    item.material_name,
                    "| SKU:",
                    item.sku,
                    "| Cost:",
                    item.unit_cost,
                )


if __name__ == "__main__":
    seed_database()
