from sqlalchemy import Column, Integer, String, DateTime
from precognito.work_orders.database import Base
from datetime import datetime

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    assetId = Column(String, unique=True, index=True)
    assetName = Column(String)
    manual = Column(String)
    mttr = Column(String)

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    assetId = Column(String, index=True)
    status = Column(String)
    remarks = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)