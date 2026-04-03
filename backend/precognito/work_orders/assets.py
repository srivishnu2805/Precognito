from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from precognito.work_orders.database import SessionLocal
from precognito.work_orders.models import Asset

router = APIRouter(prefix="/assets", tags=["Assets"])


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# GET all assets
@router.get("/")
def get_assets(db: Session = Depends(get_db)):
    return db.query(Asset).all()


# CREATE asset
@router.post("/")
def create_asset(data: dict, db: Session = Depends(get_db)):
    asset = Asset(
        assetId=data["assetId"],
        assetName=data["assetName"],
        manual=data.get("manual"),
        mttr=data.get("mttr"),
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset