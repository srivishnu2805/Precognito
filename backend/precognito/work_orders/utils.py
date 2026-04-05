"""
Utility functions for work order management, including automated creation and assignment.
"""
from .database import SessionLocal
from . import models
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

def create_automatic_work_order(device_id: str, severity: str, reason: str):
    """Automatically generates a work order when an anomaly exceeds thresholds.

    Performs automated technician assignment based on availability and workload
    balancing (round-robin style using lastAssigned timestamp).

    Args:
        device_id (str): The unique identifier of the machine/asset.
        severity (str): The severity level of the detected anomaly.
        reason (str): The reason or fault type detected.

    Returns:
        models.Audit: The newly created work order (Audit) object, or None 
                      if an active work order already exists or creation failed.
    """
    db = SessionLocal()
    try:
        # Check if there's already an active work order
        existing = db.query(models.Audit).filter(
            models.Audit.assetId == device_id,
            models.Audit.status.in_(["PENDING", "IN_PROGRESS", "CHECK_IN"])
        ).first()
        
        if existing:
            return None
            
        # Find an available technician (FR 17.4: Verify labor rosters)
        # Strategy: Pick technician who hasn't been assigned a task for the longest time
        tech = db.query(models.Roster).filter(
            models.Roster.status == "AVAILABLE"
        ).order_by(models.Roster.lastAssigned.asc().nulls_first()).first()
        
        assigned_to = tech.userId if tech else "UNASSIGNED"
        
        new_wo = models.Audit(
            assetId=device_id,
            status="PENDING",
            remarks=f"AUTO-GENERATED: {severity} anomaly detected. Reason: {reason}",
            assignedTo=assigned_to
        )
        db.add(new_wo)
        
        # Update technician status/last assigned
        if tech:
            tech.lastAssigned = datetime.now(timezone.utc)
            # Optional: tech.status = "BUSY" 
            
        db.commit()
        db.refresh(new_wo)
        
        logger.info(f"✅ Created Work Order {new_wo.id} for {device_id}, assigned to {assigned_to}")
        return new_wo
    except Exception as e:
        logger.error(f"Failed to auto-generate work order: {e}")
        db.rollback()
    finally:
        db.close()
