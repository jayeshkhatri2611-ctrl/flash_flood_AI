"""
Pydantic API models for Flash Flood Prediction System (SIH26192)
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    rainfall: float = Field(..., description="24-hour cumulative rainfall in mm (IMD)", ge=0.0, le=500.0)
    rainfall_intensity: Optional[float] = Field(None, description="Peak hourly rainfall intensity in mm/h (IMD)", ge=0.0, le=150.0)
    soil_moisture: float = Field(..., description="Soil moisture saturation percentage 0-100% (Satellite/In-situ)", ge=0.0, le=100.0)
    river_level: float = Field(..., description="Current river stage height in meters (CWC)", ge=0.0, le=25.0)
    elevation: float = Field(..., description="Mean catchment elevation in meters (NRSC/Bhuvan)", ge=50.0, le=8000.0)
    slope: float = Field(..., description="Mean catchment terrain slope in degrees (NRSC/Bhuvan)", ge=0.0, le=75.0)
    region_id: Optional[str] = Field(None, description="Optional region identifier for context")

class PredictionResponse(BaseModel):
    risk_score: float = Field(..., description="Flash flood risk score on scale 0 to 100")
    risk_level: str = Field(..., description="Risk tier: LOW, MODERATE, HIGH, or CRITICAL")
    contributing_factors: List[str] = Field(..., description="Primary environmental factors contributing to the score")
    recommended_action: str = Field(..., description="Standard operating guideline for local emergency authorities")
    feature_importance: Dict[str, float] = Field(..., description="Estimated feature contributions for explainability")
    engineered_metrics: Dict[str, float] = Field(..., description="Intermediate physics-based indicators")
    timestamp: str = Field(..., description="Prediction timestamp")
    model_version: str = Field(default="RandomForest-v1.0 (SIH-2026-MVP)")

class EnvironmentalData(BaseModel):
    rainfall: float
    rainfall_intensity: float
    soil_moisture: float
    river_level: float
    danger_level: float
    elevation: float
    slope: float
    catchment_area_sqkm: float

class RiskAssessment(BaseModel):
    risk_score: float
    risk_level: str
    trend: str
    contributing_factors: List[str]
    recommended_action: str
    last_updated: str

class HourlyHistory(BaseModel):
    hour: str
    rainfall_mm: float
    river_level_m: float
    soil_moisture_pct: float
    risk_score: float

class Region(BaseModel):
    id: str
    name: str
    state: str
    lat: float
    lng: float
    river_basin: str
    authority: str
    environmental_data: EnvironmentalData
    risk_assessment: RiskAssessment
    historical_24h: Optional[List[HourlyHistory]] = None

class AlertItem(BaseModel):
    id: str
    timestamp: str
    time_display: str
    region_id: str
    region: str
    state: str
    risk_score: float
    risk_level: str
    trigger: str
    factors: List[str]
    action_taken: str
    status: str

class DataSourceInfo(BaseModel):
    id: str
    name: str
    agency: str
    parameters: List[str]
    update_frequency: str
    mvp_status: str
    integration_type: str
    description: str

class SystemOverview(BaseModel):
    total_regions: int
    critical_regions: int
    high_risk_regions: int
    moderate_risk_regions: int
    low_risk_regions: int
    overall_status: str
    highest_risk_region: str
    highest_risk_score: float
    last_updated: str
