from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from precognito.work_orders.database import SessionLocal
from precognito.work_orders.models import Audit

router = APIRouter(prefix="/audit", tags=["Audit"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE audit log
@router.post("/")
def create_audit(data: dict, db: Session = Depends(get_db)):
    audit = Audit(
        assetId=data["assetId"],
        status=data["status"],
        remarks=data.get("remarks")
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


# GET all audits
@router.get("/")
def get_audits(db: Session = Depends(get_db)):
    return db.query(Audit).all()
@router.get("/{asset_id}")
def get_audit_by_asset(asset_id: str, db: Session = Depends(get_db)):
    return db.query(Audit).filter(Audit.assetId == asset_id).all()