"""
Debug and fix the ML model issues
"""

import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
import json

def debug_current_model():
    """Debug what's wrong with current model"""
    print("Debugging Current Model Issues")
    print("=" * 50)
    
    # Load current model
    try:
        with open('anomaly_model.pkl', 'rb') as f:
            model = pickle.load(f)
        with open('scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        with open('feature_names.json', 'r') as f:
            feature_names = json.load(f)
        with open('label_encoder.pkl', 'rb') as f:
            label_encoder = pickle.load(f)
        
        print("✅ Model files loaded successfully")
        print(f"Feature names: {feature_names}")
        
        # Test with extreme values
        test_data = {
            'Air temperature [K]': 320.0,
            'Process temperature [K]': 310.0,
            'Rotational speed [rpm]': 3000.0,
            'Torque [Nm]': 10.0,
            'Tool wear [min]': 200.0,
            'Type': 'M'
        }
        
        # Create DataFrame
        df_test = pd.DataFrame([test_data])
        df_test['Type_encoded'] = label_encoder.transform(df_test['Type'])
        df_test = df_test.drop('Type', axis=1)
        df_test = df_test[feature_names]
        
        print(f"\nTest data shape: {df_test.shape}")
        print(f"Test data:\n{df_test}")
        
        # Scale
        X_scaled = scaler.transform(df_test)
        print(f"\nScaled data:\n{X_scaled}")
        
        # Predict
        prediction = model.predict(X_scaled)
        score = model.decision_function(X_scaled)
        
        print(f"\nPrediction: {prediction}")
        print(f"Anomaly score: {score}")
        print(f"Is anomaly: {prediction[0] == -1}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def retrain_model_with_better_params():
    """Retrain model with better parameters for anomaly detection"""
    print("\nRetraining Model with Better Parameters")
    print("=" * 50)
    
    # Load dataset
    df = pd.read_csv('predictive_maintenance.csv')
    
    # Features
    feature_cols = [
        'Air temperature [K]', 
        'Process temperature [K]', 
        'Rotational speed [rpm]', 
        'Torque [Nm]', 
        'Tool wear [min]',
        'Type'
    ]
    
    X = df[feature_cols].copy()
    y = df['Target']
    
    # Encode Type
    le = LabelEncoder()
    X['Type_encoded'] = le.fit_transform(X['Type'])
    X = X.drop('Type', axis=1)
    
    feature_names = X.columns.tolist()
    
    # Split data
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Isolation Forest with different parameters
    # Higher contamination to be more sensitive
    contamination = 0.1  # 10% instead of 3.4%
    
    iso_forest = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=200,
        max_samples='auto'
    )
    
    iso_forest.fit(X_train_scaled)
    
    # Test
    y_pred = iso_forest.predict(X_test_scaled)
    y_pred_binary = [0 if p == 1 else 1 for p in y_pred]
    
    print(f"Contamination: {contamination}")
    print(f"Test accuracy: {np.mean(y_pred_binary == y_test):.3f}")
    
    # Test on extreme cases
    extreme_cases = [
        [320.0, 310.0, 3000.0, 10.0, 200.0, 1],  # Extreme
        [298.0, 308.0, 1500.0, 40.0, 50.0, 1],   # Normal
    ]
    
    for i, case in enumerate(extreme_cases):
        df_case = pd.DataFrame([case], columns=feature_names)
        X_case_scaled = scaler.transform(df_case)
        pred = iso_forest.predict(X_case_scaled)
        score = iso_forest.decision_function(X_case_scaled)
        print(f"Case {i+1}: Pred={pred[0]}, Score={score[0]:.3f}, Anomaly={pred[0] == -1}")
    
    # Save new model
    with open('anomaly_model.pkl', 'wb') as f:
        pickle.dump(iso_forest, f)
    with open('scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    with open('feature_names.json', 'w') as f:
        json.dump(feature_names, f)
    with open('label_encoder.pkl', 'wb') as f:
        pickle.dump(le, f)
    
    print("\n✅ New model saved with better parameters!")

def test_fixed_model():
    """Test the fixed model"""
    print("\nTesting Fixed Model")
    print("=" * 30)
    
    from core import detect_anomaly
    
    test_cases = [
        {
            "name": "Extreme Anomaly",
            "data": {
                "machine_id": "TEST_EXTREME",
                "temperature": 320.0,
                "vibration": 3000.0,
                "torque": 10.0,
                "type": "M"
            }
        },
        {
            "name": "Normal",
            "data": {
                "machine_id": "TEST_NORMAL",
                "temperature": 300.0,
                "vibration": 1500.0,
                "torque": 40.0,
                "type": "M"
            }
        }
    ]
    
    for case in test_cases:
        result = detect_anomaly(case["data"])
        print(f"{case['name']}: Anomaly={result['anomaly_detected']}, "
              f"Confidence={result['ml_analysis']['confidence']:.3f}, "
              f"Method={result['ml_analysis']['method']}")

if __name__ == "__main__":
    debug_current_model()
    retrain_model_with_better_params()
    test_fixed_model()
