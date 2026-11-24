"""
Data preprocessing and multi-source data fusion pipeline
for Hilly Region Flash Flood Prediction System (SIH26192)
"""
import math

try:
    import numpy as np
except ImportError:
    np = None

# Feature names expected by the ML model
BASE_FEATURE_NAMES = [
    "rainfall",
    "rainfall_intensity",
    "soil_moisture",
    "river_level",
    "elevation",
    "slope"
]

ENGINEERED_FEATURE_NAMES = [
    "rainfall",
    "rainfall_intensity",
    "soil_moisture",
    "river_level",
    "elevation",
    "slope",
    "soil_saturation_ratio",
    "effective_precipitation_index",
    "runoff_potential_factor",
    "river_danger_ratio",
    "terrain_funnel_factor"
]

def engineer_features(data_dict):
    """
    Transforms raw multi-source environmental inputs into physics-informed features.
    
    Inputs:
        rainfall: 24h cumulative rainfall in mm (IMD)
        rainfall_intensity: Peak hourly rainfall intensity in mm/h (IMD)
        soil_moisture: Volumetric soil moisture saturation % (0-100)
        river_level: Current water level gauge height in meters (CWC)
        elevation: Mean catchment elevation in meters (NRSC/Bhuvan DEM)
        slope: Mean catchment slope in degrees (NRSC/Bhuvan DEM)
    """
    rainfall = float(data_dict.get("rainfall", 0.0))
    rainfall_intensity = float(data_dict.get("rainfall_intensity", rainfall / 6.0 if rainfall > 0 else 0.0))
    soil_moisture = float(data_dict.get("soil_moisture", 50.0))
    river_level = float(data_dict.get("river_level", 1.5))
    elevation = float(data_dict.get("elevation", 1200.0))
    slope = float(data_dict.get("slope", 20.0))

    # Clamp realistic ranges
    rainfall = max(0.0, rainfall)
    rainfall_intensity = max(0.0, rainfall_intensity)
    soil_moisture = max(0.0, min(100.0, soil_moisture))
    river_level = max(0.0, river_level)
    elevation = max(100.0, elevation)
    slope = max(0.0, min(65.0, slope))

    # 1. Soil Saturation Ratio (0.0 to 1.0)
    soil_sat = soil_moisture / 100.0

    # 2. Effective Precipitation Index (rainfall weighted by intensity surge)
    effective_precip = rainfall * (1.0 + (rainfall_intensity / 40.0))

    # 3. Runoff Potential Factor: Saturated ground + steep slope = rapid hydraulic surge
    slope_rad = math.radians(slope)
    runoff_factor = (soil_sat ** 1.3) * (0.3 + 0.7 * math.sin(slope_rad)) * (1.0 + effective_precip / 120.0)

    # 4. River Danger Ratio (assuming benchmark bankfull stage of 4.5m for mountainous streams)
    river_danger_ratio = river_level / 4.5

    # 5. Terrain Funnel Factor: High altitude steep valleys funnel surface runoff violently
    terrain_funnel = (slope / 45.0) * (1.0 + (elevation / 3000.0))

    return [
        rainfall,
        rainfall_intensity,
        soil_moisture,
        river_level,
        elevation,
        slope,
        float(soil_sat),
        float(effective_precip),
        float(runoff_factor),
        float(river_danger_ratio),
        float(terrain_funnel)
    ]

def calculate_physics_heuristic_risk(rainfall, rainfall_intensity, soil_moisture, river_level, elevation, slope):
    """
    Physics-based baseline ground-truth estimator for generating training data 
    and ensuring deterministic consistency in mountainous catchments.
    """
    # Normalized components (0 to 1)
    # Rainfall component (critical threshold > 100mm/24h or cloudburst > 40mm/h)
    p_cum = min(1.0, rainfall / 150.0)
    p_int = min(1.0, rainfall_intensity / 45.0)
    p_score = 0.65 * p_cum + 0.35 * p_int

    # Soil moisture component (wet antecedent condition significantly reduces infiltration)
    s_score = (soil_moisture / 100.0) ** 1.4

    # River stage component (above 3.5m is high, above 4.5m is critical overflow)
    r_score = min(1.0, river_level / 4.5)

    # Terrain slope & elevation component (steeper slopes accelerate time of concentration)
    t_score = min(1.0, (slope / 45.0) * 0.75 + (min(elevation, 3000.0) / 3000.0) * 0.25)

    # Multi-source fusion weightings based on hydrological research in Himalayan terrain:
    # Precip (35%), Soil Antecedent (25%), River Baseline (25%), Terrain Acceleration (15%)
    # Interaction terms: saturated soil + high rainfall + high river = exponential risk spike
    interaction = p_score * s_score * (0.8 + 0.4 * r_score)

    raw_risk = (
        0.32 * p_score +
        0.23 * s_score +
        0.25 * r_score +
        0.10 * t_score +
        0.10 * interaction
    ) * 100.0

    # Ensure non-linear amplification in extreme conditions
    if rainfall > 120 and soil_moisture > 75 and river_level > 3.5:
        raw_risk = max(raw_risk, 82.0)
    elif rainfall < 15 and river_level < 2.0 and soil_moisture < 45:
        raw_risk = min(raw_risk, 25.0)

    clipped = max(0.0, min(100.0, raw_risk))
    return round(float(clipped), 1)

def classify_risk_level(score):
    """Classifies risk score (0-100) into standard disaster management alert tier"""
    if score <= 30.0:
        return "LOW"
    elif score <= 60.0:
        return "MODERATE"
    elif score <= 80.0:
        return "HIGH"
    else:
        return "CRITICAL"
