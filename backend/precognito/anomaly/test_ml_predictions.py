"""
Test ML anomaly detection with real predictions
"""

import pandas as pd
from core import detect_anomaly
import json

def test_on_dataset_samples():
    """Test ML model on samples from the actual dataset"""
    print("Testing ML Model on Dataset Samples")
    print("=" * 50)
    
    # Load dataset
    df = pd.read_csv('predictive_maintenance.csv')
    
    # Test on some normal samples
    normal_samples = df[df['Target'] == 0].head(5)
    print("\nTesting NORMAL samples (should be non-anomalous):")
    print("-" * 50)
    
    for idx, row in normal_samples.iterrows():
        # Convert dataset format to API input format
        test_data = {
            "machine_id": f"M{row['UDI']}",
            "temperature": row['Air temperature [K]'],
            "vibration": row['Rotational speed [rpm]'],  # Map to vibration
            "torque": row['Torque [Nm]'],
            "tool_wear": row['Tool wear [min]'],
            "type": row['Type']
        }
        
        result = detect_anomaly(test_data)
        
        print(f"Sample {row['UDI']}: Target={row['Target']} | "
              f"Predicted={result['anomaly_detected']} | "
              f"Confidence={result['ml_analysis']['confidence']:.3f} | "
              f"Method={result['ml_analysis']['method']}")
    
    # Test on some anomaly samples
    anomaly_samples = df[df['Target'] == 1].head(5)
    print("\nTesting ANOMALY samples (should be anomalous):")
    print("-" * 50)
    
    for idx, row in anomaly_samples.iterrows():
        # Convert dataset format to API input format
        test_data = {
            "machine_id": f"M{row['UDI']}",
            "temperature": row['Air temperature [K]'],
            "vibration": row['Rotational speed [rpm]'],  # Map to vibration
            "torque": row['Torque [Nm]'],
            "tool_wear": row['Tool wear [min]'],
            "type": row['Type']
        }
        
        result = detect_anomaly(test_data)
        
        print(f"Sample {row['UDI']}: Target={row['Target']} | "
              f"Predicted={result['anomaly_detected']} | "
              f"Confidence={result['ml_analysis']['confidence']:.3f} | "
              f"Method={result['ml_analysis']['method']} | "
              f"Failure={row['Failure Type']}")
    
    # Test on custom edge cases
    print("\nTesting CUSTOM edge cases:")
    print("-" * 50)
    
    edge_cases = [
        {
            "name": "Extreme Temperature",
            "data": {
                "machine_id": "EDGE1",
                "temperature": 320.0,  # Very high
                "vibration": 1500.0,
                "torque": 40.0,
                "type": "M"
            }
        },
        {
            "name": "Extreme Vibration",
            "data": {
                "machine_id": "EDGE2", 
                "temperature": 300.0,
                "vibration": 3000.0,  # Very high
                "torque": 40.0,
                "type": "L"
            }
        },
        {
            "name": "Low Torque High Speed",
            "data": {
                "machine_id": "EDGE3",
                "temperature": 300.0,
                "vibration": 2500.0,
                "torque": 10.0,  # Very low
                "type": "H"
            }
        },
        {
            "name": "Perfect Normal",
            "data": {
                "machine_id": "NORMAL1",
                "temperature": 300.0,
                "vibration": 1500.0,
                "torque": 40.0,
                "tool_wear": 50.0,
                "type": "M"
            }
        }
    ]
    
    for case in edge_cases:
        result = detect_anomaly(case["data"])
        print(f"{case['name']}: "
              f"Anomaly={result['anomaly_detected']} | "
              f"Confidence={result['ml_analysis']['confidence']:.3f} | "
              f"Score={result['ml_analysis']['score']:.3f}")

def test_api_format():
    """Test with API-like input format"""
    print("\n\nTesting API Format Input")
    print("=" * 50)
    
    # Test cases in API format
    api_test_cases = [
        {
            "machine_id": "API_TEST_1",
            "temperature": 298.1,
            "vibration": 1551,
            "torque": 42.8,
            "type": "M"
        },
        {
            "machine_id": "API_TEST_2", 
            "temperature": 304.5,
            "vibration": 2800,
            "torque": 15.0,
            "type": "L"
        }
    ]
    
    for i, test_case in enumerate(api_test_cases, 1):
        print(f"\nAPI Test Case {i}:")
        print(f"Input: {json.dumps(test_case, indent=2)}")
        
        result = detect_anomaly(test_case)
        
        print(f"Result:")
        print(f"  Anomaly Detected: {result['anomaly_detected']}")
        print(f"  Overall Confidence: {result['confidence']:.3f}")
        print(f"  ML Method: {result['ml_analysis']['method']}")
        print(f"  ML Confidence: {result['ml_analysis']['confidence']:.3f}")
        print(f"  ML Score: {result['ml_analysis']['score']:.3f}")
        
        if result['pattern_analysis']['anomaly_detected']:
            print(f"  Pattern Anomalies: {result['pattern_analysis']['spike_anomalies']}")

def evaluate_model_performance():
    """Evaluate model performance on a larger sample"""
    print("\n\nModel Performance Evaluation")
    print("=" * 50)
    
    # Load dataset
    df = pd.read_csv('predictive_maintenance.csv')
    
    # Sample 200 records for evaluation
    sample_df = df.sample(n=200, random_state=42)
    
    correct_predictions = 0
    total_predictions = 0
    
    for idx, row in sample_df.iterrows():
        test_data = {
            "machine_id": f"EVAL_{row['UDI']}",
            "temperature": row['Air temperature [K]'],
            "vibration": row['Rotational speed [rpm]'],
            "torque": row['Torque [Nm]'],
            "tool_wear": row['Tool wear [min]'],
            "type": row['Type']
        }
        
        result = detect_anomaly(test_data)
        predicted_anomaly = result['anomaly_detected']
        actual_anomaly = row['Target'] == 1
        
        if predicted_anomaly == actual_anomaly:
            correct_predictions += 1
        total_predictions += 1
    
    accuracy = correct_predictions / total_predictions * 100
    print(f"Sample Size: {total_predictions}")
    print(f"Correct Predictions: {correct_predictions}")
    print(f"Accuracy: {accuracy:.1f}%")
    
    # Count anomalies in sample
    anomaly_count = (sample_df['Target'] == 1).sum()
    normal_count = (sample_df['Target'] == 0).sum()
    print(f"Actual Anomalies: {anomaly_count}")
    print(f"Actual Normals: {normal_count}")

if __name__ == "__main__":
    test_on_dataset_samples()
    test_api_format()
    evaluate_model_performance()
    
    print("\n" + "=" * 60)
    print("ML Model Testing Completed!")
    print("The system now uses trained Isolation Forest model")
    print("with fallback to threshold-based detection.")
