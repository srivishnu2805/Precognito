from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import sys
import os

# Add parent directory to path so it can import ml module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.inference_engine import PredictiveInferenceEngine

app = FastAPI(title="Precognito - Predictive Inference Engine API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inference_engine = None
latest_prediction = {
    "rul_hours": 500.0,
    "confidence_pct": 100,
    "fault_type": "Normal",
    "risk_level": "Healthy",
    "recommendation": "Normal Operation"
}

class TelemetryPayload(BaseModel):
    machine_id: int
    vibration_rms: float
    temperature: float
    freq_spike_1x: float
    freq_spike_bpfo: float

@app.on_event("startup")
def load_models():
    global inference_engine
    if os.path.exists("models/rul_model.joblib"):
        inference_engine = PredictiveInferenceEngine(model_dir="models")
    else:
        print("Warning: Models not trained yet. Run python -m ml.train first.")

@app.post("/predict/rul")
def predict_rul(data: TelemetryPayload):
    global inference_engine
    if not inference_engine:
        if os.path.exists("models/rul_model.joblib"):
            inference_engine = PredictiveInferenceEngine(model_dir="models")
        else:
            raise HTTPException(status_code=503, detail="Models not loaded. Train models first.")
    
    telemetry_data = {
        "vibration_rms": data.vibration_rms,
        "temperature": data.temperature,
        "freq_spike_1x": data.freq_spike_1x,
        "freq_spike_bpfo": data.freq_spike_bpfo
    }
    
    
    result = inference_engine.predict(telemetry_data)
    
    global latest_prediction
    latest_prediction = {
        "rul_hours": result.get("predicted_rul_hours"),
        "confidence_pct": result.get("confidence_score_percent"),
        "fault_type": result.get("predicted_fault_type"),
        "risk_level": result.get("risk_level"),
        "recommendation": result.get("recommendation")
    }
    
    return {
        "status": "success",
        "machine_id": data.machine_id,
        "prediction": result
    }

@app.get("/api/predict")
def get_predict():
    return latest_prediction

# Mount frontend directory for static serving
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
os.makedirs(frontend_path, exist_ok=True)
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

@app.get("/")
async def serve_frontend():
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend not found. Please create frontend folder with index.html"}
