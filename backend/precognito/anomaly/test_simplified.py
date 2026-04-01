"""
Test simplified anomaly detection system
"""

from core import detect_anomaly, process_file
import json

def test_single_detection():
    """Test single anomaly detection"""
    print("Testing Single Detection:")
    print("="*40)
    
    # Test normal data
    result = detect_anomaly({
        "machine_id": "M1",
        "temperature": 305.0,
        "vibration": 1500.0,
        "torque": 45.0
    })
    print(f"Normal: {result['anomaly_detected']}, Severity: {result['severity']}")
    
    # Test spike data
    result = detect_anomaly({
        "machine_id": "M1",
        "temperature": 450.0,
        "vibration": 1500.0,
        "torque": 45.0
    })
    print(f"Spike: {result['anomaly_detected']}, Severity: {result['severity']}")
    print(f"Reason: {result['reason']}")

def test_batch_processing():
    """Test batch processing"""
    print("\nTesting Batch Processing:")
    print("="*40)
    
    # Process existing file
    summary = process_file("input_data.json", "simplified")
    print(f"Summary: {summary['anomalies_detected']}/{summary['total_records']} anomalies")

if __name__ == "__main__":
    test_single_detection()
    test_batch_processing()
