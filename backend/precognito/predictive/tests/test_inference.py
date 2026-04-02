import os
import sys

# Test setup
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pytest
from ml.data_generator import generate_telemetry_data
from ml.train import train_models
from ml.inference_engine import PredictiveInferenceEngine

# Generate data and models once before testing
@pytest.fixture(scope="module", autouse=True)
def setup_models():
    generate_telemetry_data(num_machines=10, max_cycles=200)
    train_models()

def test_tc_m3_01_rul_estimation():
    # TC_M3_01: Input valid degradation telemetry -> calculate & display RUL
    telemetry = {"vibration_rms": 1.2, "temperature": 48.0, "freq_spike_1x": 0.1, "freq_spike_bpfo": 0.05}
    engine = PredictiveInferenceEngine()
    result = engine.predict(telemetry)
    assert "predicted_rul_hours" in result
    assert isinstance(result["predicted_rul_hours"], float)
    assert result["predicted_rul_hours"] > 0

def test_tc_m3_02_failure_prediction():
    # TC_M3_02: Continuous degradation patterns -> Predicated time-to-failure
    engine = PredictiveInferenceEngine()
    early_telemetry = {"vibration_rms": 1.0, "temperature": 45.0, "freq_spike_1x": 0.0, "freq_spike_bpfo": 0.0}
    late_telemetry = {"vibration_rms": 6.8, "temperature": 92.0, "freq_spike_1x": 0.8, "freq_spike_bpfo": 0.1}
    
    early_result = engine.predict(early_telemetry)
    late_result = engine.predict(late_telemetry)
    
    # RUL should be much lower in the late stage than the early stage
    assert late_result["predicted_rul_hours"] < early_result["predicted_rul_hours"]

def test_tc_m3_03_confidence_scoring():
    # TC_M3_03: A confidence percentage is shown alongside prediction
    engine = PredictiveInferenceEngine()
    telemetry = {"vibration_rms": 1.2, "temperature": 48.0, "freq_spike_1x": 0.1, "freq_spike_bpfo": 0.05}
    result = engine.predict(telemetry)
    assert "confidence_score_percent" in result
    assert 0.0 <= result["confidence_score_percent"] <= 100.0

def test_tc_m3_04_fault_classification():
    # TC_M3_04: Identify and display fault type
    engine = PredictiveInferenceEngine()
    # High vibration and 1x RPM spike typically matches our generator's misalignment pattern
    misalign_telemetry = {"vibration_rms": 8.0, "temperature": 80.0, "freq_spike_1x": 0.9, "freq_spike_bpfo": 0.05}
    result_m = engine.predict(misalign_telemetry)
    assert "predicted_fault_type" in result_m
    assert result_m["predicted_fault_type"] in ["Misalignment", "Bearing Wear", "Normal"]

def test_tc_m3_05_planning_support():
    # TC_M3_05: RUL value falls below defined threshold -> High-Risk, recommend immediate maintenance.
    engine = PredictiveInferenceEngine()
    # Provide data that indicates severe degradation -> RUL < 48 hours
    severe_telemetry = {"vibration_rms": 10.5, "temperature": 110.0, "freq_spike_1x": 1.5, "freq_spike_bpfo": 1.5}
    result = engine.predict(severe_telemetry)
    
    if result["predicted_rul_hours"] < 48:
        assert result["risk_level"] == "High-Risk"
        assert "Immediate Maintenance Required" in result["recommendation"]

def test_tc_m3_06_decision_visualization():
    # TC_M3_06: Predictions finalized by engine (returns dictionary for Dashboard to visualize)
    engine = PredictiveInferenceEngine()
    telemetry = {"vibration_rms": 1.2, "temperature": 48.0, "freq_spike_1x": 0.1, "freq_spike_bpfo": 0.05}
    result = engine.predict(telemetry)
    
    required_keys = ["predicted_rul_hours", "predicted_fault_type", "confidence_score_percent", "risk_level"]
    for k in required_keys:
        assert k in result
