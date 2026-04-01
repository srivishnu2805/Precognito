"""
Train ML anomaly detection model on predictive_maintenance.csv
"""

import pandas as pd
import numpy as np
import pickle
import json
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

def load_and_preprocess_data():
    """Load and preprocess the dataset"""
    print("Loading dataset...")
    df = pd.read_csv('predictive_maintenance.csv')
    
    # Features for anomaly detection
    feature_cols = [
        'Air temperature [K]', 
        'Process temperature [K]', 
        'Rotational speed [rpm]', 
        'Torque [Nm]', 
        'Tool wear [min]',
        'Type'
    ]
    
    # Prepare features
    X = df[feature_cols].copy()
    y = df['Target']  # 0 = normal, 1 = anomaly
    
    # Encode categorical variable
    le = LabelEncoder()
    X['Type_encoded'] = le.fit_transform(X['Type'])
    X = X.drop('Type', axis=1)
    
    # Feature names for later use
    feature_names = X.columns.tolist()
    
    print(f"Dataset shape: {X.shape}")
    print(f"Anomalies: {y.sum()} ({y.sum()/len(y)*100:.1f}%)")
    
    return X, y, feature_names, le

def train_isolation_forest(X, y):
    """Train Isolation Forest model"""
    print("Training Isolation Forest model...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Isolation Forest
    # Since we have labeled data, we can use contamination parameter
    contamination = y_train.sum() / len(y_train)
    
    iso_forest = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100
    )
    
    iso_forest.fit(X_train_scaled)
    
    # Predict on test set
    y_pred = iso_forest.predict(X_test_scaled)
    # Convert predictions: 1 = normal, -1 = anomaly to 0 = normal, 1 = anomaly
    y_pred_binary = [0 if p == 1 else 1 for p in y_pred]
    
    # Evaluate
    print("\nModel Evaluation:")
    print(f"Contamination rate: {contamination:.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred_binary))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_binary))
    
    return iso_forest, scaler

def save_model_and_metadata(model, scaler, feature_names, label_encoder):
    """Save trained model and metadata"""
    print("\nSaving model and metadata...")
    
    # Save model
    with open('anomaly_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    # Save scaler
    with open('scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save feature names
    with open('feature_names.json', 'w') as f:
        json.dump(feature_names, f)
    
    # Save label encoder
    with open('label_encoder.pkl', 'wb') as f:
        pickle.dump(label_encoder, f)
    
    # Save feature statistics for validation
    feature_stats = {
        'feature_names': feature_names,
        'model_type': 'IsolationForest',
        'contamination': None,
        'features_count': len(feature_names)
    }
    
    with open('feature_stats.json', 'w') as f:
        json.dump(feature_stats, f)
    
    print("Model and metadata saved successfully!")

def test_model_on_sample_data():
    """Test the trained model on sample data"""
    print("\nTesting model on sample data...")
    
    # Load model and scaler
    with open('anomaly_model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    
    with open('feature_names.json', 'r') as f:
        feature_names = json.load(f)
    
    with open('label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
    
    # Sample test cases
    test_cases = [
        # Normal case
        {
            'Air temperature [K]': 298.1,
            'Process temperature [K]': 308.6,
            'Rotational speed [rpm]': 1551,
            'Torque [Nm]': 42.8,
            'Tool wear [min]': 0,
            'Type': 'M'
        },
        # Potential anomaly (high temperature)
        {
            'Air temperature [K]': 304.0,
            'Process temperature [K]': 313.0,
            'Rotational speed [rpm]': 1551,
            'Torque [Nm]': 42.8,
            'Tool wear [min]': 50,
            'Type': 'M'
        },
        # Potential anomaly (low torque, high speed)
        {
            'Air temperature [K]': 298.1,
            'Process temperature [K]': 308.6,
            'Rotational speed [rpm]': 2800,
            'Torque [Nm]': 10.0,
            'Tool wear [min]': 100,
            'Type': 'L'
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        # Prepare data
        df_test = pd.DataFrame([test_case])
        df_test['Type_encoded'] = label_encoder.transform(df_test['Type'])
        df_test = df_test.drop('Type', axis=1)
        
        # Ensure correct feature order
        X_test = df_test[feature_names]
        
        # Scale
        X_test_scaled = scaler.transform(X_test)
        
        # Predict
        prediction = model.predict(X_test_scaled)
        anomaly_score = model.decision_function(X_test_scaled)
        
        # Convert prediction
        is_anomaly = prediction[0] == -1
        
        print(f"\nTest Case {i}:")
        print(f"Data: {test_case}")
        print(f"Prediction: {'ANOMALY' if is_anomaly else 'NORMAL'}")
        print(f"Anomaly Score: {anomaly_score[0]:.4f}")

def main():
    """Main training pipeline"""
    print("Starting ML Anomaly Detection Training Pipeline")
    print("=" * 60)
    
    try:
        # Load and preprocess data
        X, y, feature_names, label_encoder = load_and_preprocess_data()
        
        # Train model
        model, scaler = train_isolation_forest(X, y)
        
        # Save model and metadata
        save_model_and_metadata(model, scaler, feature_names, label_encoder)
        
        # Test on sample data
        test_model_on_sample_data()
        
        print("\n" + "=" * 60)
        print("Training completed successfully!")
        print("Model saved as: anomaly_model.pkl")
        print("Scaler saved as: scaler.pkl")
        
    except Exception as e:
        print(f"Error during training: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
