"""
SQLAlchemy models for inventory management and part reservations.
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from ..work_orders.database import Base
from datetime import datetime, timezone

class Inventory(Base):
    """Represents a spare part or consumable in the inventory.

    Attributes:
        id (int): Primary key.
        partName (str): Human-readable name of the part.
        partNumber (str): Unique identifier/SKU for the part.
        quantity (int): Current stock level.
        minThreshold (int): Minimum stock level before triggering a reorder alert.
        leadTimeDays (int): Expected number of days for delivery after ordering.
        costPerUnit (Decimal): Price per single unit.
        category (str): Part category (e.g., Bearings, Sensors).
        lastRestocked (datetime): Timestamp of the last stock update.
    """
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    partName = Column(String, nullable=False)
    partNumber = Column(String, unique=True, index=True, nullable=False)
    quantity = Column(Integer, default=0)
    minThreshold = Column(Integer, default=5)
    leadTimeDays = Column(Integer, default=7)
    costPerUnit = Column(Numeric(10, 2), default=0.00)
    category = Column(String)
    lastRestocked = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class PartReservation(Base):
    """Represents a reservation of parts for a specific work order.

    Attributes:
        id (int): Primary key.
        partId (int): ID of the reserved part.
        workOrderId (int): ID of the associated work order.
        quantity (int): Number of units reserved.
        status (str): Current status (RESERVED, CONSUMED, CANCELLED).
        timestamp (datetime): When the reservation was made.
    """
    __tablename__ = "part_reservations"

    id = Column(Integer, primary_key=True, index=True)
    partId = Column(Integer, ForeignKey("inventory.id", ondelete="CASCADE"))
    workOrderId = Column(Integer)
    quantity = Column(Integer, nullable=False)
    status = Column(String, default="RESERVED")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
