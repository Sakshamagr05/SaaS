
from fastapi import FastAPI

from src.routes.materials import router as materials_router
from src.routes.suppliers import router as suppliers_router
from src.routes.consumers import router as consumers_router
from src.routes.accounts import router as accounts_router

app = FastAPI(title="Manufacturing SaaS API")

app.include_router(materials_router)
app.include_router(suppliers_router)
app.include_router(consumers_router)
app.include_router(accounts_router)

@app.get("/")
def root():
    return {"message": "Manufacturing SaaS API is running"}
