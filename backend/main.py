
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.materials import router as materials_router
from src.routes.suppliers import router as suppliers_router
from src.routes.consumers import router as consumers_router
from src.routes.accounts import router as accounts_router
from src.routes.purchase_orders import router as purchase_orders_router
from src.routes.shipments import router as shipments_router
from src.routes.inventory import router as inventory_router
from src.routes.warehouse import router as warehouse_router

app = FastAPI(title="Manufacturing SaaS API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(materials_router)
app.include_router(suppliers_router)
app.include_router(consumers_router)
app.include_router(accounts_router)
app.include_router(purchase_orders_router)
app.include_router(shipments_router)
app.include_router(inventory_router)
app.include_router(warehouse_router)

@app.get("/")
def root():
    return {"message": "Manufacturing SaaS API is running"}
