import os
import joblib
import pandas as pd
import numpy as np

class PredictiveInferenceEngine:
    def __init__(self, model_dir="models"):
        # Default to models directory relative to parent folder
        if not os.path.exists(model_dir):
            # Check for models folder in the parent directory
            parent_dir_models = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
            if os.path.exists(parent_dir_models):
                model_dir = parent_dir_models
        
        self.scaler = joblib.load(os.path.join(model_dir, "scaler.joblib"))
        self.rul_model = joblib.load(os.path.join(model_dir, "rul_model.joblib"))
        self.fault_model = joblib.load(os.path.join(model_dir, "fault_model.joblib"))
    
    def predict(self, telemetry_data: dict) -> dict:
        features = ["vibration_rms", "temperature", "freq_spike_1x", "freq_spike_bpfo"]
        
        df_row = {f: telemetry_data.get(f, 0.0) for f in features}
        df = pd.DataFrame([df_row])
        
        X_scaled = self.scaler.transform(df)
        
        # Predict RUL (reverse cubic root for linearity)
        rul_pred = max(0, float(self.rul_model.predict(X_scaled)[0]) ** 3.0)
        
        # Predict Fault & Probabilities
        fault_pred = self.fault_model.predict(X_scaled)[0]
        fault_probs = self.fault_model.predict_proba(X_scaled)[0]
        confidence = np.max(fault_probs) * 100.0
        
        # Risk & Thresholding Logic
        risk_level = "Normal"
        recommendation = "Continue Operation"
        if rul_pred < 48:
            risk_level = "High-Risk"
            recommendation = "Immediate Maintenance Required"
        elif rul_pred < 150:
            risk_level = "Warning"
            recommendation = "Schedule Maintenance"
            
        return {
            "predicted_rul_hours": round(float(rul_pred), 2),
            "predicted_fault_type": str(fault_pred),
            "confidence_score_percent": round(float(confidence), 2),
            "risk_level": risk_level,
            "recommendation": recommendation
        }
