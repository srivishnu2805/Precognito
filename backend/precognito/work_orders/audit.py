"""
API router for managing audit logs and maintenance records.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from precognito.work_orders.database import SessionLocal
from precognito.work_orders.models import Audit
from precognito.inventory.models import Inventory
from precognito.auth import technician_above
from precognito.work_orders.schemas import AuditCreateRequest, WorkOrderCompleteRequest

router = APIRouter(prefix="/audit", tags=["Audit"])


def get_db():
    """Dependency to get a SQLAlchemy database session.

    Yields:
        Session: A database session instance.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE audit log
@router.post("/", dependencies=[technician_above])
def create_audit(request: AuditCreateRequest, db: Session = Depends(get_db)):
    """Creates a new audit log entry.

    Args:
        request (AuditCreateRequest): Request model containing audit details.
        db (Session): Database session dependency.

    Returns:
        Audit: The newly created Audit object.
    """
    audit = Audit(
        assetId=request.assetId,
        status=request.status,
        remarks=request.remarks,
        assignedTo=request.assignedTo,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


# GET all audits
@router.get("/")
def get_audits(db: Session = Depends(get_db)):
    """Retrieves all audit logs from the database.

    Args:
        db (Session): Database session dependency.

    Returns:
        list: A list of all Audit objects.
    """
    return db.query(Audit).all()


@router.get("/{asset_id}")
def get_audit_by_asset(asset_id: str, db: Session = Depends(get_db)):
    """Retrieves all audit logs for a specific asset.

    Args:
        asset_id (str): The unique identifier of the asset.
        db (Session): Database session dependency.

    Returns:
        list: A list of Audit objects for the specified asset.
    """
    return db.query(Audit).filter(Audit.assetId == asset_id).all()


@router.patch("/{audit_id}/complete", dependencies=[technician_above])
def complete_work_order(
    audit_id: int, request: WorkOrderCompleteRequest, db: Session = Depends(get_db)
):
    """Finalizes a work order, deducting parts and calculating costs.

    Args:
        audit_id (int): The ID of the work order to complete.
        request (WorkOrderCompleteRequest): Completion details.
        db (Session): Database session dependency.

    Returns:
        dict: Success status and finalized cost.
    """
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Work order not found")

    resolution = request.resolution
    part_id = request.partId
    qty = request.quantityUsed
    labor_hours = request.laborHours

    total_parts_cost = 0.0

    # 1. Process Inventory if part used
    if part_id and qty > 0:
        part = db.query(Inventory).filter(Inventory.id == part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found in inventory")

        if part.quantity < qty:
            raise HTTPException(
                status_code=400, detail=f"Insufficient stock for {part.partName}"
            )

        part.quantity -= qty
        total_parts_cost = float(part.costPerUnit) * qty

    # 2. Calculate Labor Cost (Prototype rate: $80/hr)
    labor_cost = labor_hours * 80.0
    actual_cost = total_parts_cost + labor_cost

    # 3. Update Work Order
    audit.status = "COMPLETED"
    audit.resolution = resolution
    audit.partId = part_id
    audit.quantityUsed = qty
    audit.actualCost = actual_cost
    audit.completedAt = datetime.now(timezone.utc)

    db.commit()

    return {
        "status": "success",
        "workOrderId": audit.id,
        "actualCost": actual_cost,
        "message": f"Work order completed. Total cost: ${actual_cost:.2f}",
    }
