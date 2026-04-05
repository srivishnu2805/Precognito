"""
API router for managing industrial assets.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Asset
from ..auth import manager_above
from .schemas import AssetCreateRequest

router = APIRouter(prefix="/assets", tags=["Assets"])

# DB dependency
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

# GET all assets
@router.get("/")
def get_assets(db: Session = Depends(get_db)):
    """Retrieves all assets from the database.

    Args:
        db (Session): Database session dependency.

    Returns:
        list: A list of all Asset objects.
    """
    return db.query(Asset).all()

# CREATE asset
@router.post("/", dependencies=[manager_above])
def create_asset(request: AssetCreateRequest, db: Session = Depends(get_db)):
    """Creates a new asset in the database.

    Args:
        request (AssetCreateRequest): Request model containing asset details.
        db (Session): Database session dependency.

    Returns:
        Asset: The newly created Asset object.
    """
    asset = Asset(
        assetId=request.assetId,
        assetName=request.assetName,
        manual=request.manual,
        mttr=request.mttr,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset
