"""
Test the fixed API with proper anomaly detection
"""

from core import detect_anomaly
import json

def test_fixed_anomaly_detection():
    """Test the fixed anomaly detection"""
    print("Testing Fixed Anomaly Detection")
    print("=" * 40)
    
    test_cases = [
        {
            "name": "Extreme Temperature Anomaly",
            "data": {
                "machine_id": "EXTREME_TEMP",
                "temperature": 320.0,
                "vibration": 1500.0,
                "torque": 40.0,
                "type": "M"
            }
        },
        {
            "name": "Extreme Vibration Anomaly",
            "data": {
                "machine_id": "EXTREME_VIB",
                "temperature": 300.0,
                "vibration": 3000.0,
                "torque": 40.0,
                "type": "L"
            }
        },
        {
            "name": "Low Torque Anomaly",
            "data": {
                "machine_id": "LOW_TORQUE",
                "temperature": 300.0,
                "vibration": 1500.0,
                "torque": 8.0,
                "type": "H"
            }
        },
        {
            "name": "Normal Machine",
            "data": {
                "machine_id": "NORMAL_001",
                "temperature": 300.0,
                "vibration": 1500.0,
                "torque": 40.0,
                "type": "M"
            }
        },
        {
            "name": "Multiple Anomalies",
            "data": {
                "machine_id": "MULTI_ANOMALY",
                "temperature": 325.0,
                "vibration": 2800.0,
                "torque": 10.0,
                "tool_wear": 200.0,
                "type": "L"
            }
        }
    ]
    
    for case in test_cases:
        print(f"\n{case['name']}:")
        print(f"Input: {json.dumps(case['data'], indent=2)}")
        
        result = detect_anomaly(case['data'])
        
        print(f"Result:")
        print(f"  Anomaly Detected: {result['anomaly_detected']}")
        print(f"  Overall Confidence: {result['confidence']:.3f}")
        print(f"  ML Method: {result['ml_analysis']['method']}")
        print(f"  ML Confidence: {result['ml_analysis']['confidence']:.3f}")
        print(f"  ML Score: {result['ml_analysis']['score']:.3f}")
        print(f"  Reason: {result['reason']}")
        
        if result['anomaly_detected']:
            print("  🚨 ANOMALY DETECTED!")
        else:
            print("  ✅ Normal operation")

def test_batch_anomalies():
    """Test batch anomaly detection"""
    print("\n\nTesting Batch Anomaly Detection")
    print("=" * 40)
    
    batch_data = {
        "data": [
            {
                "machine_id": "BATCH_NORMAL_1",
                "temperature": 300.0,
                "vibration": 1500.0,
                "torque": 40.0,
                "type": "M"
            },
            {
                "machine_id": "BATCH_ANOMALY_1",
                "temperature": 325.0,
                "vibration": 1500.0,
                "torque": 40.0,
                "type": "M"
            },
            {
                "machine_id": "BATCH_NORMAL_2",
                "temperature": 298.0,
                "vibration": 1400.0,
                "torque": 38.0,
                "type": "L"
            },
            {
                "machine_id": "BATCH_ANOMALY_2",
                "temperature": 300.0,
                "vibration": 3000.0,
                "torque": 10.0,
                "type": "H"
            }
        ]
    }
    
    from core import get_detector
    detector = get_detector()
    results = detector.detect_batch([item for item in batch_data["data"]])
    
    print(f"Processed {len(results)} items:")
    for i, result in enumerate(results):
        status = "🚨 ANOMALY" if result['anomaly_detected'] else "✅ Normal"
        print(f"  {i+1}. {result['machine_id']}: {status} (Conf: {result['confidence']:.3f})")

if __name__ == "__main__":
    test_fixed_anomaly_detection()
    test_batch_anomalies()
