"""
Simplified FastAPI router for anomaly detection
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime
from core import AnomalyDetector

# Create router
router = APIRouter(prefix="/anomaly", tags=["Anomaly Detection"])

# Pydantic models
class SensorData(BaseModel):
    machine_id: str
    temperature: Optional[float] = None
    vibration: Optional[float] = None
    torque: Optional[float] = None

class BatchSensorData(BaseModel):
    data: List[SensorData]

class AnomalyResponse(BaseModel):
    machine_id: str
    timestamp: str
    anomaly_detected: bool
    anomaly_types: List[str]
    severity: str
    confidence: float
    metrics: Dict[str, float]
    reason: str

# Global detector
_detector = None

def get_detector_instance():
    global _detector
    if _detector is None:
        _detector = AnomalyDetector()
    return _detector

@router.get("/")
async def root():
    return {"service": "Anomaly Detection API", "version": "2.0"}

@router.post("/detect", response_model=AnomalyResponse)
async def detect_anomaly(sensor_data: SensorData):
    """Detect anomaly for single sensor reading"""
    try:
        detector = get_detector_instance()
        result = detector.detect_anomaly(sensor_data.dict())
        return AnomalyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect/batch", response_model=List[AnomalyResponse])
async def detect_batch_anomalies(batch_data: BatchSensorData):
    """Detect anomalies for multiple sensor readings"""
    try:
        detector = get_detector_instance()
        data_list = [item.dict() for item in batch_data.data]
        results = detector.detect_batch(data_list)
        return [AnomalyResponse(**result) for result in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{machine_id}")
async def get_machine_history(machine_id: str):
    """Get rolling window history for machine"""
    try:
        detector = get_detector_instance()
        history = detector.get_history(machine_id)
        return {"machine_id": machine_id, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statistics/{machine_id}")
async def get_machine_statistics(machine_id: str):
    """Get statistics for machine"""
    try:
        detector = get_detector_instance()
        stats = detector.get_statistics(machine_id)
        return {"machine_id": machine_id, "statistics": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get system status"""
    detector = get_detector_instance()
    return {
        "initialized": detector.initialized,
        "model_loaded": detector.model is not None,
        "supported_sensors": list(detector.pattern_detector.history.keys())
    }
