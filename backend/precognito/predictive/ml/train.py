import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from joblib import dump

def train_models():
    print("Loading data...")
    df = pd.read_csv("data/telemetry_dataset.csv")

    features = ["vibration_rms", "temperature", "freq_spike_1x", "freq_spike_bpfo"]
    target_rul = "rul"
    target_fault = "fault_type"

    X = df[features]
    # Linearize the target variable (since we used x^3 in generation)
    y_rul = df[target_rul] ** (1/3.0)
    y_fault = df[target_fault]

    # Standardize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train test splits for RUL
    X_r_train, X_r_test, y_r_train, y_r_test = train_test_split(X_scaled, y_rul, test_size=0.2, random_state=42)
    # Train test splits for Fault Type
    X_f_train, X_f_test, y_f_train, y_f_test = train_test_split(X_scaled, y_fault, test_size=0.2, random_state=42)
    
    print("Training RUL Regressor...")
    from xgboost import XGBRegressor
    # Regression for RUL estimation using XGBoost for higher accuracy
    rul_model = XGBRegressor(n_estimators=1000, max_depth=12, learning_rate=0.01, random_state=42)
    rul_model.fit(X_r_train, y_r_train)
    rul_score = rul_model.score(X_r_test, y_r_test)
    print(f"RUL R^2 Score: {rul_score:.4f}")

    print("Training Fault Classifier...")
    # Classification for likely faults
    fault_model = RandomForestClassifier(n_estimators=100, random_state=42)
    fault_model.fit(X_f_train, y_f_train)
    fault_score = fault_model.score(X_f_test, y_f_test)
    print(f"Fault Classification Accuracy: {fault_score:.4f}")

    # Save the models
    os.makedirs('models', exist_ok=True)
    dump(scaler, "models/scaler.joblib")
    dump(rul_model, "models/rul_model.joblib")
    dump(fault_model, "models/fault_model.joblib")
    print("Models saved successfully in 'models/' directory.")

if __name__ == "__main__":
    train_models()
