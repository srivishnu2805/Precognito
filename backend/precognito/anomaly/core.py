"""
Consolidated core anomaly detection engine
Combines pattern detection, ML model, and batch processing

Features:
- ML-based anomaly detection using Isolation Forest
- Pattern-based spike detection using Z-score analysis
- Threshold-based fallback detection
- Hybrid result combination for maximum accuracy
- Batch processing for multiple sensor readings
- REST API integration via FastAPI

Author: Pavan Aditya
Version: 1.0
Date: April 2026
"""

import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from collections import defaultdict, deque
from pathlib import Path

# Configuration
# These are the sensor ranges used for threshold-based detection
# and fallback when ML model is unavailable
SENSOR_CONFIG = {
    "temperature": {"min": 295.0, "max": 305.0, "critical": 310.0},
    "vibration": {"min": 1000.0, "max": 2000.0, "critical": 2500.0}, 
    "torque": {"min": 20.0, "max": 60.0, "critical": 80.0}
}

# Severity thresholds for anomaly classification
SEVERITY_THRESHOLDS = {"LOW": 0.1, "MODERATE": 0.25, "HIGH": 0.5, "CRITICAL": 0.75}

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PatternDetector:
    def __init__(self, window_size: int = 10, spike_threshold: float = 1.5):
        self.window_size = window_size
        self.spike_threshold = spike_threshold
        self.history = defaultdict(lambda: defaultdict(lambda: deque(maxlen=window_size)))

    def add_record(self, machine_id: str, data: Dict):
        for sensor, value in data.items():
            if sensor in SENSOR_CONFIG and value is not None:
                self.history[machine_id][sensor].append(float(value))

    def detect_spike(self, machine_id: str, sensor: str, current_value: float) -> Tuple[bool, float, str]:
        if sensor not in self.history[machine_id] or len(self.history[machine_id][sensor]) < 3:
            return False, 0.0, "Insufficient data"
        
        recent_values = list(self.history[machine_id][sensor])[:-1]
        mean_val, std_val = np.mean(recent_values), np.std(recent_values)
        
        if std_val == 0:
            return False, 0.0, "No variance"
        
        z_score = abs((current_value - mean_val) / std_val)
        # Higher threshold for pattern detection to reduce false positives
        is_spike = z_score > 3.0  # Increased from 2.5
        
        reason = f"Spike: {sensor}={current_value:.2f} deviates {z_score:.2f}σ from mean {mean_val:.2f}"
        return is_spike, z_score, reason

    def detect_pattern_anomaly(self, machine_id: str, data: Dict):
        result = {
            "anomaly_detected": False,
            "anomaly_types": [],
            "severity": "LOW",
            "confidence": 0.0,
            "reason": "No pattern anomalies detected",
            "spike_anomalies": {}
        }

        # 🔥 FIX: detect BEFORE adding to history
        for sensor, value in data.items():
            if sensor in SENSOR_CONFIG and value is not None:
                is_spike, score, reason = self.detect_spike(machine_id, sensor, float(value))

                if is_spike:
                    result["anomaly_detected"] = True
                    result["anomaly_types"].append(sensor)
                    result["spike_anomalies"][sensor] = {
                        "score": score,
                        "reason": reason
                    }
                    result["confidence"] = max(result["confidence"], min(score / 5, 1.0))
                    result["reason"] = reason

        # 🔥 NOW add to history AFTER detection
        self.add_record(machine_id, data)

        if result["anomaly_detected"]:
            result["severity"] = "HIGH" if result["confidence"] > 0.7 else "MODERATE"

        return result

class AnomalyDetector:
    """
    Unified anomaly detection with pattern analysis and ML
    
    This class combines pattern-based spike detection with ML-based anomaly detection
    using a trained Isolation Forest model.
    
    Args:
        window_size: Number of data points to keep in history (default: 10)
    """
    
    def __init__(self, window_size: int = 10):
        self.pattern_detector = PatternDetector(window_size)
        self.model = None
        self.scaler = None
        self.feature_stats = {}
        self.feature_names = []
        self.initialized = False
        self._load_model()
    
    def _load_model(self):
        """Load trained model and scaler"""
        try:
            import pickle
            model_path = Path("anomaly_model.pkl")
            scaler_path = Path("scaler.pkl")
            
            if model_path.exists() and scaler_path.exists():
                self.model = pickle.load(open(model_path, 'rb'))
                self.scaler = pickle.load(open(scaler_path, 'rb'))
                
                # Load feature names
                feature_names_path = Path("feature_names.json")
                if feature_names_path.exists():
                    with open(feature_names_path, 'r') as f:
                        self.feature_names = json.load(f)
                
                # Load feature stats
                stats_path = Path("feature_stats.json")
                if stats_path.exists():
                    with open(stats_path, 'r') as f:
                        self.feature_stats = json.load(f)
                
                self.initialized = True
                logger.info("ML model loaded successfully")
            else:
                logger.warning("Model files not found, using fallback detection")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
    
    def detect_anomaly(self, data: Dict, timestamp: str = None) -> Dict:
        """Main anomaly detection method"""
        if not self.initialized:
            return self._error_response(data, timestamp, "Detector not initialized")
        
        try:
            machine_id = data.get("machine_id")
            if not machine_id:
                return self._error_response(data, timestamp, "machine_id required")
            
            # Pattern detection
            pattern_result = self.pattern_detector.detect_pattern_anomaly(machine_id, data)
            
            # ML detection (simplified)
            ml_result = self._detect_ml_anomaly(data)
            
            # Combine results - ML should take priority
            final_anomaly = pattern_result["anomaly_detected"] or ml_result["anomaly_detected"]
            
            return {
                "machine_id": machine_id,
                "timestamp": timestamp or datetime.now().isoformat(),
                "anomaly_detected": bool(final_anomaly),
                "anomaly_types": list(set(pattern_result["anomaly_types"] + ml_result["anomaly_types"])),
                "severity": self._calculate_severity(pattern_result, ml_result, final_anomaly),
                "confidence": max(pattern_result["confidence"], ml_result["confidence"]),
                "metrics": {k: float(v) for k, v in data.items() if k in SENSOR_CONFIG},
                "reason": self._combine_reasons(pattern_result, ml_result),
                "pattern_analysis": {
                    "anomaly_detected": pattern_result["anomaly_detected"],
                    "confidence": pattern_result["confidence"],
                    "spike_anomalies": pattern_result["spike_anomalies"]
                },
                "ml_analysis": ml_result
            }
            
        except Exception as e:
            return self._error_response(data, timestamp, f"Detection failed: {str(e)}")
    
    def _detect_ml_anomaly(self, data: Dict) -> Dict:
        """ML-based anomaly detection using trained model"""
        try:
            if self.model is None or self.scaler is None:
                # Fallback to threshold-based detection
                return self._threshold_detection(data)
            
            # Prepare data for ML model
            import pandas as pd
            
            # Map input data to training data format
            # Note: API input maps to training dataset features
            features = {
                'Air temperature [K]': float(data.get('temperature', 300.0)),
                'Process temperature [K]': float(data.get('temperature', 300.0)) + 10.0,  # Estimate
                'Rotational speed [rpm]': float(data.get('vibration', 1500.0)),
                'Torque [Nm]': float(data.get('torque', 40.0)),
                'Tool wear [min]': float(data.get('tool_wear', 50.0)),
                'Type': data.get('type', 'M')
            }
            
            # Create DataFrame and encode categorical
            df_features = pd.DataFrame([features])
            
            # Load label encoder if available
            try:
                import pickle
                with open('label_encoder.pkl', 'rb') as f:
                    label_encoder = pickle.load(f)
                df_features['Type_encoded'] = label_encoder.transform(df_features['Type'])
                df_features = df_features.drop('Type', axis=1)
            except:
                # Fallback: simple encoding
                type_mapping = {'L': 0, 'M': 1, 'H': 2}
                df_features['Type_encoded'] = df_features['Type'].map(type_mapping).fillna(1)
                df_features = df_features.drop('Type', axis=1)
            
            # Ensure correct feature order
            if hasattr(self, 'feature_names') and self.feature_names:
                df_features = df_features[self.feature_names]
            
            # Scale features
            features_scaled = self.scaler.transform(df_features)
            
            # Predict anomaly
            prediction = self.model.predict(features_scaled)[0]
            anomaly_score = self.model.decision_function(features_scaled)[0]
            
            # Convert prediction: -1 = anomaly, 1 = normal
            is_anomaly = prediction == -1
            
            # Calculate confidence based on anomaly score
            # More aggressive threshold for anomaly detection
            confidence = abs(anomaly_score)
            
            # Only flag as anomaly if score is significantly negative OR extreme values
            if anomaly_score < -0.1:  # Higher threshold for true anomalies only
                is_anomaly = True
                confidence = abs(anomaly_score)
            
            # Also check if it's an extreme value (beyond 3.5 standard deviations)
            if any(abs(val) > 3.5 for val in features_scaled[0]):
                is_anomaly = True
                confidence = max(confidence, 0.8)
            
            confidence = min(max(confidence, 0.0), 1.0)
            
            return {
                "anomaly_detected": is_anomaly,
                "anomaly_types": ["ML_Detected"] if is_anomaly else [],
                "confidence": confidence,
                "score": anomaly_score,
                "method": "ML_IsolationForest"
            }
            
        except Exception as e:
            logger.error(f"ML detection failed: {e}")
            # Fallback to threshold detection
            return self._threshold_detection(data)
    
    def _threshold_detection(self, data: Dict) -> Dict:
        """Fallback threshold-based detection"""
        anomaly_detected = False
        anomaly_types = []
        confidence = 0.0
        
        # Use updated sensor config matching dataset ranges
        sensor_config = {
            "temperature": {"min": 295.0, "max": 305.0, "critical": 310.0},
            "vibration": {"min": 1000.0, "max": 2000.0, "critical": 2500.0},
            "torque": {"min": 20.0, "max": 60.0, "critical": 80.0}
        }
        
        for sensor, value in data.items():
            if sensor in sensor_config and value is not None:
                config = sensor_config[sensor]
                if value < config["min"] or value > config["critical"]:
                    anomaly_detected = True
                    anomaly_types.append(sensor)
                    confidence = max(confidence, 0.6)
        
        return {
            "anomaly_detected": anomaly_detected,
            "anomaly_types": anomaly_types,
            "confidence": confidence,
            "score": confidence,
            "method": "Threshold"
        }
    
    def _calculate_severity(self, pattern_result: Dict, ml_result: Dict, final_anomaly: bool) -> str:
        """Calculate combined severity"""
        if not final_anomaly:
            return "LOW"
        
        pattern_sev = "HIGH" if pattern_result["severity"] == "HIGH" else "MODERATE"
        ml_sev = "HIGH" if ml_result["confidence"] > 0.7 else "MODERATE"
        
        if pattern_result["anomaly_detected"] and ml_result["anomaly_detected"]:
            return "HIGH"
        elif pattern_result["anomaly_detected"]:
            return pattern_sev
        else:
            return ml_sev
    
    def _combine_reasons(self, pattern_result: Dict, ml_result: Dict) -> str:
        """Combine detection reasons"""
        reasons = []
        if pattern_result["anomaly_detected"]:
            reasons.append(pattern_result["reason"])
        if ml_result["anomaly_detected"]:
            reasons.append(f"Threshold-based detection")
        return "; ".join(reasons) if reasons else "No anomalies detected"
    
    def _error_response(self, data: Dict, timestamp: str, error: str) -> Dict:
        """Create error response"""
        return {
            "machine_id": data.get("machine_id", "unknown"),
            "timestamp": timestamp or datetime.now().isoformat(),
            "anomaly_detected": False,
            "anomaly_types": [],
            "severity": "LOW",
            "confidence": 0.0,
            "metrics": {},
            "reason": error,
            "error": error
        }
    
    def detect_batch(self, data_list: List[Dict]) -> List[Dict]:
        results = []
        for data in data_list:
            result = self.detect_anomaly(data)  # sequential pattern learning
            results.append(result)
        return results      
    
    def get_history(self, machine_id: str) -> Dict:
        """Get machine history"""
        return {sensor: list(values) for sensor, values in self.pattern_detector.history[machine_id].items()}
    
    def get_statistics(self, machine_id: str) -> Dict:
        """Get machine statistics"""
        stats = {}
        for sensor, values in self.pattern_detector.history[machine_id].items():
            if len(values) > 0:
                values_list = list(values)
                stats[sensor] = {
                    "count": len(values_list),
                    "mean": np.mean(values_list),
                    "std": np.std(values_list),
                    "min": np.min(values_list),
                    "max": np.max(values_list),
                    "latest": values_list[-1]
                }
        return stats

# Global instance
_detector = None

def get_detector():
    """Get global detector instance"""
    global _detector
    if _detector is None:
        _detector = AnomalyDetector()
    return _detector

# Convenience functions
def detect_anomaly(data: Dict) -> Dict:
    """Detect anomaly for single data point"""
    return get_detector().detect_anomaly(data)

def detect_batch(data_list: List[Dict]) -> List[Dict]:
    """Detect anomalies for batch data"""
    return get_detector().detect_batch(data_list)

def process_file(input_file: str, output_prefix: str = "output") -> Dict:
    """Process input file and generate outputs"""
    detector = get_detector()
    
    # Load input
    with open(input_file, 'r') as f:
        input_data = json.load(f)
    
    print(f"Processing {len(input_data)} records...")
    
    # Process batch
    results = detector.detect_batch(input_data)
    
    # Generate summary
    total = len(results)
    anomalies = sum(1 for r in results if r["anomaly_detected"])
    
    summary = {
        "total_records": total,
        "anomalies_detected": anomalies,
        "normal_records": total - anomalies,
        "anomaly_rate": (anomalies / total) * 100 if total > 0 else 0,
        "processing_time": datetime.now().isoformat()
    }
    
    # Save outputs
    with open(f"{output_prefix}_results.json", 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    with open(f"{output_prefix}_summary.json", 'w') as f:
        json.dump({"summary": summary, "results": results}, f, indent=2, default=str)
    
    # Export CSV
    df = pd.DataFrame([{
        "machine_id": r["machine_id"],
        "timestamp": r["timestamp"],
        "anomaly_detected": r["anomaly_detected"],
        "severity": r["severity"],
        "confidence": r["confidence"],
        "reason": r["reason"],
        **r["metrics"]
    } for r in results])
    df.to_csv(f"{output_prefix}_results.csv", index=False)
    
    print(f"Generated: {output_prefix}_results.json, {output_prefix}_summary.json, {output_prefix}_results.csv")
    print(f"Anomalies: {anomalies}/{total} ({summary['anomaly_rate']:.1f}%)")
    
    return summary

if __name__ == "__main__":
    # Example usage
    if Path("input_data.json").exists():
        process_file("input_data.json")
    else:
        # Test single detection
        test_data = {"machine_id": "M1", "temperature": 305.0, "vibration": 1500.0, "torque": 45.0}
        result = detect_anomaly(test_data)
        print("Test result:", json.dumps(result, indent=2, default=str))
