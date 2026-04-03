from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from precognito.work_orders.database import SessionLocal
from precognito.inventory import models
from precognito.ingestion.influx_client import query_latest_data

router = APIRouter(prefix="/inventory", tags=["Inventory"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[dict])
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(models.Inventory).all()
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

@router.post("/reserve")
def reserve_part(data: dict, db: Session = Depends(get_db)):
    part_id = data.get("partId")
    quantity = data.get("quantity", 1)
    work_order_id = data.get("workOrderId")
    
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

@router.get("/jit-alerts")
def get_jit_procurement_alerts(db: Session = Depends(get_db)):
    """
    US-3.1: Trigger JIT alert when RUL < Lead-Time + 10%
    """
    from precognito.ingestion.influx_client import get_all_devices
    
    device_ids = get_all_devices()
    alerts = []
    
    for d_id in device_ids:
        pred_tables = query_latest_data(d_id, "predictive_results")
        rul_hours = 0.0
        
        if pred_tables:
            for table in pred_tables:
                for record in table.records:
                    if record.get_field() == "predicted_rul_hours":
                        rul_hours = record.get_value()
        
        # Check against inventory parts needed for this asset type
        # For prototype, we'll assume every asset needs 'Bearings' (Lead time 7 days = 168h)
        bearing_part = db.query(models.Inventory).filter(models.Inventory.category == "Bearings").first()
        
        if bearing_part:
            lead_time_hours = bearing_part.leadTimeDays * 24
            # Buffer 10% as per US-3.1
            threshold = lead_time_hours * 1.1
            
            if rul_hours < threshold:
                alerts.append({
                    "deviceId": d_id,
                    "partName": bearing_part.partName,
                    "rulHours": round(rul_hours, 1),
                    "leadTimeHours": lead_time_hours,
                    "priority": "CRITICAL" if rul_hours < lead_time_hours else "HIGH",
                    "message": f"Procure {bearing_part.partName} immediately. RUL ({round(rul_hours, 1)}h) is nearing lead time ({lead_time_hours}h)."
                })
                
    return alerts
