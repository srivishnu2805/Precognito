from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from precognito.work_orders.database import Base
from datetime import datetime

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    partName = Column(String, nullable=False)
    partNumber = Column(String, unique=True, index=True, nullable=False)
    quantity = Column(Integer, default=0)
    minThreshold = Column(Integer, default=5)
    leadTimeDays = Column(Integer, default=7)
    costPerUnit = Column(Numeric(10, 2), default=0.00)
    category = Column(String)
    lastRestocked = Column(DateTime, default=datetime.utcnow)

class PartReservation(Base):
    __tablename__ = "part_reservations"

    id = Column(Integer, primary_key=True, index=True)
    partId = Column(Integer, ForeignKey("inventory.id", ondelete="CASCADE"))
    workOrderId = Column(Integer)
    quantity = Column(Integer, nullable=False)
    status = Column(String, default="RESERVED")
    timestamp = Column(DateTime, default=datetime.utcnow)
