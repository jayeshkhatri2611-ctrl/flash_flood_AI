import pandas as pd
import numpy as np
import math

csv_path = r"C:\Users\jayesh khatri\.gemini\antigravity\scratch\sih-flash-flood-mvp\backend\data\uploaded_dataset\flood_risk_dataset_india.csv"
df = pd.read_csv(csv_path)

print(f"Loaded {len(df)} records from user dataset.")

# Soil Type Runoff Multipliers (SCS-CN hydrologic soil group standards)
soil_multiplier = {
    'Clay': 1.35,   # Low permeability, high flash runoff
    'Peat': 1.25,   # Highly saturated organic soil
    'Silt': 1.05,   # Moderate infiltration
    'Loam': 0.85,   # Balanced absorption
    'Sandy': 0.65   # High infiltration, lower surface runoff
}

# Land Cover Runoff Coefficients (Rational method standards)
land_multiplier = {
    'Urban': 1.30,        # Impervious asphalt/concrete
    'Water Body': 1.40,   # Saturated/open water
    'Desert': 1.15,       # Sparse vegetation, flash runoff
    'Agricultural': 0.90, # Cultivated fields
    'Forest': 0.70        # Dense canopy and root absorption
}

# Map features into the 11 engineered features expected by the system:
# 1. rainfall: from 'Rainfall (mm)'
# 2. rainfall_intensity: calculated from rainfall and humidity surge
# 3. soil_moisture: modeled from humidity (%) adjusted by soil type
# 4. river_level: from 'Water Level (m)'
# 5. elevation: from 'Elevation (m)'
# 6. slope: estimated from elevation gradient and river discharge
# 7. soil_saturation_ratio
# 8. effective_precipitation_index
# 9. runoff_potential_factor
# 10. river_danger_ratio
# 11. terrain_funnel_factor

records = []
for idx, row in df.iterrows():
    rf = float(row['Rainfall (mm)'])
    humidity = float(row['Humidity (%)'])
    water_lvl = float(row['Water Level (m)'])
    elevation = float(row['Elevation (m)'])
    discharge = float(row['River Discharge (m³/s)'])
    soil_type = str(row['Soil Type'])
    land_cover = str(row['Land Cover'])
    hist_flood = int(row['Historical Floods'])
    flood_occ = int(row['Flood Occurred'])
    
    # Soil moisture from humidity and soil type
    sm_base = humidity * 0.9 + (15.0 if soil_type == 'Clay' or soil_type == 'Peat' else -10.0 if soil_type == 'Sandy' else 0.0)
    soil_moisture = float(np.clip(sm_base, 10.0, 99.0))
    
    # Rainfall intensity (monsoon bursts)
    intensity = float(np.clip(rf / 6.0 + (humidity / 100.0) * 5.0, 0.0, 55.0))
    
    # Mountain slope: estimated from elevation and river flow velocity
    # In hilly regions, higher elevations and energetic discharges correlate with steeper catchment gradients
    slope_est = float(np.clip(10.0 + (min(elevation, 4000.0) / 4000.0) * 28.0 + (discharge / 5000.0) * 12.0, 5.0, 55.0))
    
    # Soil Saturation Ratio
    soil_sat = soil_moisture / 100.0
    
    # Effective Precipitation Index
    effective_precip = rf * (1.0 + (intensity / 40.0))
    
    # Runoff Potential Factor with Soil & Land Cover weighting
    s_factor = soil_multiplier.get(soil_type, 1.0)
    l_factor = land_multiplier.get(land_cover, 1.0)
    slope_rad = math.radians(slope_est)
    runoff_factor = (soil_sat ** 1.3) * (0.3 + 0.7 * math.sin(slope_rad)) * (1.0 + effective_precip / 120.0) * s_factor * l_factor
    
    # River Danger Ratio (benchmark 4.5m)
    river_danger_ratio = water_lvl / 4.5
    
    # Terrain Funnel Factor
    terrain_funnel = (slope_est / 45.0) * (1.0 + (elevation / 3000.0))
    
    # Hydrological Flood Risk Score (0-100) combining multi-source physics + empirical flood occurrence
    p_cum = min(1.0, rf / 150.0)
    p_int = min(1.0, intensity / 45.0)
    p_score = 0.65 * p_cum + 0.35 * p_int
    s_score = (soil_moisture / 100.0) ** 1.4 * s_factor
    r_score = min(1.0, water_lvl / 4.5)
    t_score = min(1.0, (slope_est / 45.0) * 0.75 + (min(elevation, 3000.0) / 3000.0) * 0.25)
    
    interaction = p_score * s_score * (0.8 + 0.4 * r_score)
    
    # Base risk score
    risk_score = (
        0.30 * p_score +
        0.22 * s_score +
        0.25 * r_score +
        0.10 * t_score +
        0.13 * interaction
    ) * 100.0
    
    # Empirical historical weight: if historical floods occurred or infrastructure is vulnerable
    if hist_flood == 1:
        risk_score += 4.0
    if flood_occ == 1 and rf > 80:
        risk_score += 6.0
    elif flood_occ == 0 and rf < 40 and water_lvl < 3.0:
        risk_score -= 5.0
        
    risk_score = round(float(np.clip(risk_score, 0.0, 100.0)), 1)
    
    feat_vector = [
        rf,
        intensity,
        soil_moisture,
        water_lvl,
        elevation,
        slope_est,
        soil_sat,
        effective_precip,
        runoff_factor,
        river_danger_ratio,
        terrain_funnel
    ]
    
    records.append({
        "features": feat_vector,
        "risk_score": risk_score
    })

print(f"Engineered {len(records)} feature vectors from user dataset.")
print("Sample engineered feature vector:")
print(records[0]["features"])
print("Sample risk score:", records[0]["risk_score"])
