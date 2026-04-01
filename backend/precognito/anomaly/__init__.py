"""
Anomaly Detection Engine for Predictive Maintenance System

This module provides production-ready anomaly detection capabilities for industrial machinery.
It uses Isolation Forest for machine learning-based anomaly detection combined with
statistical methods for comprehensive analysis.

Features:
- Real-time anomaly detection
- Severity classification (Low, Moderate, High, Critical)
- Multi-sensor support (temperature, vibration, torque)
- Confidence scoring
- Batch processing support
- Performance monitoring

Main Components:
- AnomalyDetector: Main detection class
- AnomalyDetectionModel: Model training and management
- DataPreprocessor: Data cleaning and feature engineering
- Utils: Helper functions and utilities

Usage:
    from anomaly import detect_anomaly, train_model
    
    # Train the model
    train_model()
    
    # Detect anomalies in real-time
    result = detect_anomaly({
        "machine_id": "M1",
        "temperature": 305.0,
        "vibration": 1500.0,
        "torque": 45.0
    })
"""

__version__ = "1.0.0"
__author__ = "Anomaly Detection Engine Team"

# Import main classes and functions
from .detector import AnomalyDetector, detect_anomaly, detect_anomalies_batch, get_detector
from .model import AnomalyDetectionModel
from .preprocessing import DataPreprocessor
from .config import SENSOR_CONFIG, SEVERITY_THRESHOLDS, ISOLATION_FOREST_CONFIG

# Convenience functions for easy access
def train_model():
    """Train the anomaly detection model"""
    trainer = AnomalyDetectionModel()
    return trainer.train_and_evaluate()

def get_detector_status():
    """Get the current status of the anomaly detector"""
    detector = get_detector()
    return detector.get_detector_status()

def simulate_detection(test_data):
    """Simulate anomaly detection with various test cases"""
    detector = get_detector()
    return detector.simulate_anomaly_detection(test_data)

# Export main API
__all__ = [
    # Main classes
    'AnomalyDetector',
    'AnomalyDetectionModel', 
    'DataPreprocessor',
    
    # Main functions
    'detect_anomaly',
    'detect_anomalies_batch',
    'get_detector',
    'train_model',
    'get_detector_status',
    'simulate_detection',
    
    # Configuration
    'SENSOR_CONFIG',
    'SEVERITY_THRESHOLDS',
    'ISOLATION_FOREST_CONFIG'
]