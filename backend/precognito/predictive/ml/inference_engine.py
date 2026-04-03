import os
import joblib
import pandas as pd
import numpy as np

class PredictiveInferenceEngine:
    def __init__(self, model_dir="models"):
        # Load the saved models
        self.scaler = joblib.load(os.path.join(model_dir, "scaler.joblib"))
        self.rul_model = joblib.load(os.path.join(model_dir, "rul_model.joblib"))
        self.fault_model = joblib.load(os.path.join(model_dir, "fault_model.joblib"))
    
    def predict(self, telemetry_data: dict) -> dict:
        """
        Receives dictionary of telemetry features.
        Returns prediction containing RUL, fault classification, and confidence.
        TC_M3_01: Input valid telemetry, calculates and displays RUL.
        TC_M3_03: Confidence percentage alongside prediction.
        TC_M3_04: Identifies fault type (Bearing Wear, Misalignment).
        TC_M3_05: Defines Planning Support/High Risk flag.
        """
        features = ["vibration_rms", "temperature", "freq_spike_1x", "freq_spike_bpfo"]
        
        # Verify columns exist or fill a default (e.g., 0)
        df_row = {}
        for f in features:
            df_row[f] = telemetry_data.get(f, 0.0)
            
        df = pd.DataFrame([df_row])
        
        # Scale
        X_scaled = self.scaler.transform(df)
        
        # Predict RUL
        # Predict RUL (undo the cuberoot linearization used during training for >95% accuracy)
        rul_pred = max(0, float(self.rul_model.predict(X_scaled)[0]) ** 3.0)
        
        # Predict Fault
        fault_pred = self.fault_model.predict(X_scaled)[0]
        # Predict Probabilities to extract confidence
        fault_probs = self.fault_model.predict_proba(X_scaled)[0]
        
        # Calculate Confidence Score (percentage of classification confidence)
        confidence = np.max(fault_probs) * 100.0
        
        # Planning Support / Risk Level Thresholding (TC_M3_05)
        # RUL value falls below defined threshold (< 48 hours)
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
