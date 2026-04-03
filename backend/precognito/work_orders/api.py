from fastapi import APIRouter
from precognito.work_orders.assets import router as assets_router
from precognito.work_orders.audit import router as audit_router

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])

# Include assets routes
router.include_router(assets_router)
router.include_router(audit_router)

work_orders = [
    {"id": 1, "assetId": "ASSET-1", "status": "IN_PROGRESS"},
    {"id": 2, "assetId": "ASSET-2", "status": "COMPLETED"},
]

@router.get("/")
def get_work_orders():
    return work_orders