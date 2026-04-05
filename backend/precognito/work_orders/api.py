"""
API router for work orders, combining assets and audit sub-routers.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .assets import router as assets_router
from .audit import router as audit_router
from .database import SessionLocal
from . import models

from ..auth import authenticated_user

router = APIRouter(
    prefix="/work-orders", tags=["Work Orders"], dependencies=[authenticated_user]
)

# Include assets and audit sub-routers
router.include_router(assets_router)
router.include_router(audit_router)


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


@router.get("/")
def get_work_orders(limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    """Fetches work orders (audits) from the database with asset metadata. Supports pagination.

    Args:
        limit (int): Maximum number of results to return.
        offset (int): Number of results to skip.
        db (Session): Database session dependency.

    Returns:
        list: A list of dictionaries, each representing a work order.
    """
    # Join Audit with Asset to get name and MTTR
    results = (
        db.query(
            models.Audit, models.Asset.assetName, models.Asset.mttr, models.Asset.manual
        )
        .outerjoin(models.Asset, models.Audit.assetId == models.Asset.assetId)
        .order_by(models.Audit.timestamp.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    # Format into flat dictionary
    output = []
    for audit, name, mttr, manual in results:
        d = audit.__dict__.copy()
        d["assetName"] = name or audit.assetId
        d["mttr"] = mttr or "Unknown"
        d["manual"] = manual
        output.append(d)

    return output
