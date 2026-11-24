"""
Machine Learning Training Module for Flash Flood Prediction (SIH26192)
Uses scikit-learn RandomForestRegressor with multi-source data fusion features.
"""
import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

from preprocessing import (
    engineer_features,
    calculate_physics_heuristic_risk,
    classify_risk_level,
    ENGINEERED_FEATURE_NAMES
)

def generate_synthetic_hilly_catchment_dataset(n_samples=3500, random_state=42):
    """
    Generates a realistic synthetic hydrological dataset for mountainous terrains
    (e.g., Uttarakhand, Himachal Pradesh, Sikkim, Assam, Arunachal Pradesh, Meghalaya).
    
    Variables:
    - rainfall: 0 to 220 mm (cumulative 24h)
    - rainfall_intensity: 0 to 55 mm/hr (peak intensity)
    - soil_moisture: 10% to 98%
    - river_level: 0.5 to 6.5 meters
    - elevation: 300 to 3800 meters
    - slope: 5 to 55 degrees
    """
    np.random.seed(random_state)
    
    # 1. Rainfall distributions: Mixture of light rain, heavy monsoon, and cloudburst tails
    rf_base = np.random.exponential(scale=35.0, size=n_samples)
    rf_peaks = np.random.choice([0, 50, 100], size=n_samples, p=[0.75, 0.20, 0.05])
    rainfall = np.clip(rf_base + rf_peaks, 0.0, 220.0)
    
    # 2. Rainfall intensity: correlated with rainfall, with occasional cloudburst anomalies
    intensity_ratio = np.random.uniform(0.12, 0.35, size=n_samples)
    rainfall_intensity = np.clip(rainfall * intensity_ratio + np.random.normal(0, 2, size=n_samples), 0.0, 55.0)
    
    # 3. Soil moisture: influenced by rainfall + antecedent moisture variation
    soil_base = np.random.uniform(20.0, 85.0, size=n_samples)
    soil_moisture = np.clip(soil_base + (rainfall / 220.0) * 25.0 + np.random.normal(0, 4, size=n_samples), 10.0, 98.0)
    
    # 4. River level: correlated with rainfall, soil saturation, and local catchment baseline
    river_base = np.random.uniform(0.8, 2.5, size=n_samples)
    river_level = np.clip(river_base + (rainfall / 220.0) * 3.0 * (soil_moisture / 100.0) + np.random.normal(0, 0.2, size=n_samples), 0.4, 6.2)
    
    # 5. Mountain elevation (m)
    elevation = np.random.uniform(400.0, 3600.0, size=n_samples)
    
    # 6. Mountain slope (degrees)
    slope = np.random.uniform(8.0, 52.0, size=n_samples)
    
    records = []
    for i in range(n_samples):
        rf = float(rainfall[i])
        rfi = float(rainfall_intensity[i])
        sm = float(soil_moisture[i])
        rl = float(river_level[i])
        el = float(elevation[i])
        sl = float(slope[i])
        
        # Calculate target risk score using calibrated hydrological physics formulation
        score = calculate_physics_heuristic_risk(rf, rfi, sm, rl, el, sl)
        
        # Add small environmental measurement noise
        noise = np.random.normal(0, 1.2)
        target_score = round(float(np.clip(score + noise, 0.0, 100.0)), 1)
        risk_level = classify_risk_level(target_score)
        
        input_dict = {
            "rainfall": rf,
            "rainfall_intensity": rfi,
            "soil_moisture": sm,
            "river_level": rl,
            "elevation": el,
            "slope": sl
        }
        
        features = engineer_features(input_dict)
        records.append({
            **input_dict,
            "engineered_features": features,
            "risk_score": target_score,
            "risk_level": risk_level
        })
        
    return records

def train_and_save_model(output_dir=None):
    if output_dir is None:
        output_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Generating physics-informed synthetic hydrological training data (3,500 samples)...")
    dataset = generate_synthetic_hilly_catchment_dataset(n_samples=3500)
    
    X = np.array([item["engineered_features"] for item in dataset])
    y = np.array([item["risk_score"] for item in dataset])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluation
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    print(f"Model Performance:")
    print(f"  R2 Score: {r2:.4f}")
    print(f"  MAE: {mae:.2f}")
    print(f"  RMSE: {rmse:.2f}")
    
    # Feature importances
    importances = model.feature_importances_
    feature_importance_dict = {
        name: round(float(imp) * 100.0, 2)
        for name, imp in zip(ENGINEERED_FEATURE_NAMES, importances)
    }
    print("Feature Importances (%):", feature_importance_dict)
    
    # Save model artifact
    model_path = os.path.join(output_dir, "model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to {model_path}")
    
    # Save metadata
    meta = {
        "model_type": "RandomForestRegressor",
        "algorithm": "scikit-learn",
        "features": ENGINEERED_FEATURE_NAMES,
        "metrics": {
            "r2_score": round(float(r2), 4),
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2)
        },
        "feature_importances": feature_importance_dict,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "calibration_note": "Trained on simulated hydrological dataset modeling Himalayan/North-Eastern hilly basins. Ready for live IMD/CWC/Bhuvan data calibration."
    }
    meta_path = os.path.join(output_dir, "model_meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Metadata saved to {meta_path}")
    
    # Verification test
    test_cases = [
        {"name": "Dry Safe Weather", "data": {"rainfall": 5, "rainfall_intensity": 1, "soil_moisture": 25, "river_level": 1.2, "elevation": 1800, "slope": 25}},
        {"name": "Moderate Monsoon", "data": {"rainfall": 45, "rainfall_intensity": 12, "soil_moisture": 55, "river_level": 2.6, "elevation": 1500, "slope": 30}},
        {"name": "Heavy Downpour", "data": {"rainfall": 95, "rainfall_intensity": 25, "soil_moisture": 80, "river_level": 4.1, "elevation": 1850, "slope": 35}},
        {"name": "Cloudburst Emergency (Chamoli-like)", "data": {"rainfall": 150, "rainfall_intensity": 48, "soil_moisture": 92, "river_level": 5.4, "elevation": 2100, "slope": 42}}
    ]
    print("\nVerification Test Cases:")
    for tc in test_cases:
        feats = np.array([engineer_features(tc["data"])])
        pred_score = round(float(model.predict(feats)[0]), 1)
        level = classify_risk_level(pred_score)
        print(f"  {tc['name']}: Risk Score = {pred_score} -> Level: {level}")
        
    return model, meta

if __name__ == "__main__":
    train_and_save_model()
