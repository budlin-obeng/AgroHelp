from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CropRotationRequest(BaseModel):
    soil_type: str = Field(default="Sandy Loam", description="Soil texture type: Sandy Loam, Clay Loam, Loam, Sandy Clay Loam, etc.")
    current_crop: str = Field(default="Maize", description="Current or previous standing crop: Maize, Cassava, Yam, Rice, Cowpea, Groundnut")
    farm_size_hectares: float = Field(default=2.0, gt=0, description="Farm size in hectares")
    target_season: str = Field(default="Major Rainy Season", description="Target planting season: Major Rainy Season, Minor Rainy Season, Dry Harmattan Season")
    market_priority: float = Field(default=0.35, ge=0.0, le=1.0, description="Weight for market value / net income (0 to 1)")
    fertilizer_savings_priority: float = Field(default=0.25, ge=0.0, le=1.0, description="Weight for fertilizer cost savings (0 to 1)")
    faw_disruption_priority: float = Field(default=0.20, ge=0.0, le=1.0, description="Weight for Fall Armyworm pest disruption (0 to 1)")
    drought_resilience_priority: float = Field(default=0.20, ge=0.0, le=1.0, description="Weight for water use / drought resilience (0 to 1)")
    custom_model_path: Optional[str] = Field(default=None, description="Optional path to custom scikit-learn model file (.joblib or .pkl)")

class CropRecommendation(BaseModel):
    rank: int
    crop_name: str
    scientific_name: str
    crop_family: str
    suitability_score: float
    predicted_yield_tons_ha: float
    expected_gross_margin_ghs_ha: float
    fertilizer_reduction_pct: float
    faw_disruption_score: float
    drought_resilience_score: float
    labor_intensity: str
    soil_organic_matter_benefit: str
    season_fit: str
    agronomic_guidance: str
    tradeoffs: Dict[str, float]
    breakdown_scores: Dict[str, float]

class CropRotationResponse(BaseModel):
    pilot_region: str
    current_crop: str
    soil_type: str
    target_season: str
    environmental_context: Dict[str, Any]
    recommendations: List[CropRecommendation]
    model_metadata: Dict[str, Any]
    timestamp: str

class TradeoffRequest(BaseModel):
    crops: Optional[List[str]] = Field(default=None, description="Optional list of crop names to evaluate tradeoffs for")
    current_crop: Optional[str] = Field(default="Maize", description="Baseline crop")
    soil_type: Optional[str] = Field(default="Sandy Loam", description="Soil texture")
    target_season: Optional[str] = Field(default="Major Rainy Season", description="Planting season")
    weights: Optional[Dict[str, float]] = Field(default=None, description="Weights dictionary for priorities")

class TradeoffResponse(BaseModel):
    tradeoff_matrix: List[Dict[str, Any]]
    pareto_candidates: List[str]
    strategies: List[Dict[str, Any]]
    radar_indicators: List[str]
    benchmarks: Dict[str, Any]

class EnvironmentalProfileResponse(BaseModel):
    location: Dict[str, Any]
    decadal_summary: Dict[str, Any]
    rainfall_stats: Dict[str, Any]
    climate_stats: Dict[str, Any]
    soil_moisture_stats: Dict[str, Any]
    vegetation_stats: Dict[str, Any]
    monthly_climatology: List[Dict[str, Any]]

class PilotDataResponse(BaseModel):
    region_name: str
    coordinates: Dict[str, float]
    agro_ecological_zone: str
    baseline_monoculture_pct: float
    dominant_crops: List[str]
    challenges: List[str]
    nasa_missions: List[Dict[str, Any]]
    seasons: Dict[str, str]

class HealthResponse(BaseModel):
    status: str
    version: str
    data_loaded: bool
    data_records: Dict[str, int]
    model_loaded: bool
    model_type: str
    active_features: List[str]
