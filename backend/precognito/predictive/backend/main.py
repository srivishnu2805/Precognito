from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

try:
    from .schemas import TelemetryPayload
    from .engine import PredictiveInferenceEngine
except ImportError:
    # Handle direct execution (e.g. python backend/main.py)
    from schemas import TelemetryPayload
    from engine import PredictiveInferenceEngine

app = FastAPI(title="Precognito Server - Modular Backend", version="1.0.0")

# CORS setup for dashboard cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global engine instance and state storage
engine = None
latest_prediction = {
    "rul_hours": 0.0,
    "confidence_pct": 0.0,
    "fault_type": "None",
    "risk_level": "None",
    "recommendation": "Initializing..."
}

def get_engine():
    global engine
    if engine is None:
        try:
            # First look for models relative to root
            model_path = os.path.join(os.getcwd(), "models")
            if not os.path.exists(model_path):
                 # Look one level up if called from backend directory
                model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
            
            engine = PredictiveInferenceEngine(model_dir=model_path)
        except Exception as e:
            print(f"Engine Load Error: {e}")
            return None
    return engine

@app.on_event("startup")
async def startup_event():
    get_engine()
    print("Precognito Modular Backend Started.")

@app.post("/predict/rul")
async def predict_rul(data: TelemetryPayload):
    current_engine = get_engine()
    if not current_engine:
        raise HTTPException(status_code=503, detail="ML Models not found. Ensure /models folder is correctly placed.")
    
    telemetry_data = {
        "vibration_rms": data.vibration_rms,
        "temperature": data.temperature,
        "freq_spike_1x": data.freq_spike_1x,
        "freq_spike_bpfo": data.freq_spike_bpfo
    }
    
    prediction = current_engine.predict(telemetry_data)
    
    # Store latest for asynchronous polling (GET /api/predict)
    global latest_prediction
    latest_prediction = {
        "rul_hours": prediction.get("predicted_rul_hours"),
        "confidence_pct": prediction.get("confidence_score_percent"),
        "fault_type": prediction.get("predicted_fault_type"),
        "risk_level": prediction.get("risk_level"),
        "recommendation": prediction.get("recommendation")
    }
    
    return {
        "status": "success",
        "machine_id": data.machine_id,
        "prediction": prediction
    }

@app.get("/api/predict")
async def get_latest_prediction():
    """Retrieve the most recent prediction across all machines."""
    return latest_prediction

@app.get("/health")
async def health_check():
    return {"status": "online", "engine_loaded": engine is not None}
