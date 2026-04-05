"""
API router for inventory management and JIT procurement alerts.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from ..work_orders.database import SessionLocal
from . import models
from ..ingestion.influx_client import query_latest_data

from ..auth import authenticated_user, store_manager_above

from .schemas import PartReservationRequest, PurchaseOrderRequest

router = APIRouter(
    prefix="/inventory", 
    tags=["Inventory"],
    dependencies=[authenticated_user]
)

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

@router.get("/", response_model=List[dict])
def get_inventory(limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    """Retrieves inventory items with their current status. Supports pagination.

    Args:
        limit (int): Maximum number of results to return.
        offset (int): Number of results to skip.
        db (Session): Database session dependency.

    Returns:
        list: A list of dictionaries containing part details and stock status.
    """
    items = db.query(models.Inventory).limit(limit).offset(offset).all()
    return [
        {
            "id": i.id,
            "partName": i.partName,
            "partNumber": i.partNumber,
            "quantity": i.quantity,
            "minThreshold": i.minThreshold,
            "leadTimeDays": i.leadTimeDays,
            "costPerUnit": float(i.costPerUnit),
            "category": i.category,
            "status": "LOW_STOCK" if i.quantity <= i.minThreshold else "IN_STOCK"
        } for i in items
    ]

@router.post("/reserve", dependencies=[store_manager_above])
def reserve_part(request: PartReservationRequest, db: Session = Depends(get_db)):
    """Reserves a specific quantity of a part for a work order.

    Args:
        request (PartReservationRequest): Request model containing partId, quantity, and workOrderId.
        db (Session): Database session dependency.

    Raises:
        HTTPException: If stock is insufficient or part is not found.

    Returns:
        dict: Status and the ID of the created reservation.
    """
    part_id = request.partId
    quantity = request.quantity
    work_order_id = request.workOrderId
    
    part = db.query(models.Inventory).filter(models.Inventory.id == part_id).first()
    if not part or part.quantity < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
        
    # Create reservation
    res = models.PartReservation(partId=part_id, workOrderId=work_order_id, quantity=quantity)
    db.add(res)
    
    # Deduct from inventory
    part.quantity -= quantity
    
    db.commit()
    return {"status": "reserved", "reservationId": res.id}

@router.post("/purchase-order", dependencies=[store_manager_above])
def create_purchase_order(request: PurchaseOrderRequest, db: Session = Depends(get_db)):
    """Generates an automated purchase order for a part.

    Args:
        request (PurchaseOrderRequest): Request model containing partId and quantity.
        db (Session): Database session dependency.

    Raises:
        HTTPException: If the part is not found.

    Returns:
        dict: Generated PO details including PO number and expected delivery.
    """
    part_id = request.partId
    quantity = request.quantity
    
    part = db.query(models.Inventory).filter(models.Inventory.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
        
    # In a real app, this would trigger an ERP integration or send a PO email
    
    return {
        "status": "PO_GENERATED",
        "poNumber": f"PO-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{part.id}",
        "partName": part.partName,
        "quantity": quantity,
        "expectedDelivery": part.leadTimeDays
    }

@router.get("/jit-alerts")
def get_jit_procurement_alerts(db: Session = Depends(get_db)):
    """Triggers Just-In-Time (JIT) procurement alerts based on RUL forecasts.

    Alerts are triggered when the Remaining Useful Life (RUL) of an asset is 
    less than the lead time of required spare parts plus a 10% buffer.

    Args:
        db (Session): Database session dependency.

    Returns:
        list: A list of JIT procurement alerts for all monitored assets.
    """
    from ..ingestion.influx_client import get_all_devices
    from ..work_orders.models import Asset
    
    # Asset type to part category mapping
    PART_MAPPING = {
        "pump": "Seal Kits",
        "motor": "Bearings",
        "conveyor": "Belts",
        "fan": "Filters"
    }
    
    device_ids = get_all_devices()
    alerts = []
    
    for d_id in device_ids:
        # Fetch asset type from Postgres
        asset = db.query(Asset).filter(Asset.assetId == d_id).first()
        asset_type = asset.assetType.lower() if asset and asset.assetType else "motor" # Default to motor
        required_category = PART_MAPPING.get(asset_type, "Bearings")

        pred_tables = query_latest_data(d_id, "predictive_results")
        rul_hours = 0.0
        
        if pred_tables:
            for table in pred_tables:
                for record in table.records:
                    if record.get_field() == "predicted_rul_hours":
                        rul_hours = record.get_value()
        
        # Check against inventory parts needed for this asset type
        target_part = db.query(models.Inventory).filter(
            models.Inventory.category == required_category
        ).first()
        
        if target_part:
            lead_time_hours = target_part.leadTimeDays * 24
            # Buffer 10% as per US-3.1
            threshold = lead_time_hours * 1.1
            
            if rul_hours < threshold:
                alerts.append({
                    "deviceId": d_id,
                    "partName": target_part.partName,
                    "rulHours": round(rul_hours, 1),
                    "leadTimeHours": lead_time_hours,
                    "priority": "CRITICAL" if rul_hours < lead_time_hours else "HIGH",
                    "message": f"Procure {target_part.partName} immediately. RUL ({round(rul_hours, 1)}h) is nearing lead time ({lead_time_hours}h)."
                })
                
    return alerts
