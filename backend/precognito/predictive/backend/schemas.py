from pydantic import BaseModel

class TelemetryPayload(BaseModel):
    machine_id: int
    vibration_rms: float
    temperature: float
    freq_spike_1x: float
    freq_spike_bpfo: float

class PredictionResponse(BaseModel):
    rul_hours: float
    confidence_pct: float
    fault_type: str
    risk_level: str
    recommendation: str
