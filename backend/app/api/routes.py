"""
FastAPI REST routes for AgroHelp Crop Rotation & Earth Observation Intelligence.
Endpoints:
- POST/GET /predict-rotations
- POST/GET /tradeoffs
- GET /environmental-profile
- GET /pilot-data
- GET /health
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, status

from app.config import settings
from app.core.data_loader import data_loader
from app.core.digital_twin_store import digital_twin_store
from app.ml.engine import ml_engine
from app.schemas.models import (
    CropRotationRequest,
    CropRotationResponse,
    TradeoffRequest,
    TradeoffResponse,
    EnvironmentalProfileResponse,
    PilotDataResponse,
    HealthResponse,
)
from app.schemas.farmer import (
    FarmerRegisterRequest,
    FarmerLoginRequest,
    DigitalTwinProfile,
    DigitalTwinUpdateRequest,
    AddCustomCropRequest,
    RecordGPSRequest,
    CropFeasibilityRequest,
    CropFeasibilityResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health", response_model=HealthResponse, summary="API & Model Health Status")
def get_health():
    """Returns system status, Space2Soil data ingestion metrics, and active ML model."""
    counts = data_loader.get_record_counts()
    return HealthResponse(
        status="healthy",
        version=settings.PROJECT_VERSION,
        data_loaded=data_loader.is_loaded,
        data_records=counts,
        model_loaded=ml_engine.model_info is not None,
        model_type=ml_engine.model_info.get("model_type", "Unknown"),
        active_features=ml_engine.model_info.get("features", []),
    )

@router.post("/predict-rotations", response_model=CropRotationResponse, summary="Predict Optimal Crop Rotations")
def predict_crop_rotations(request: CropRotationRequest):
    """
    Dynamically predicts crop rotation recommendations using decadal NASA Earth Observation
    features (GPM rainfall, SMAP soil moisture, NASA POWER temperature & heat stress, Landsat NDVI)
    and user-specified multi-objective priorities.
    """
    try:
        return ml_engine.predict_rotations(request)
    except Exception as e:
        logger.exception("Error predicting crop rotations")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/predict-rotations", response_model=CropRotationResponse, summary="Predict Crop Rotations (GET shortcut)")
def get_crop_rotations(
    soil_type: str = Query("Sandy Loam", description="Soil texture type"),
    current_crop: str = Query("Maize", description="Current or baseline standing crop"),
    farm_size_hectares: float = Query(2.0, gt=0, description="Farm size in hectares"),
    target_season: str = Query("Major Rainy Season", description="Target planting season"),
    market_priority: float = Query(0.35, ge=0, le=1, description="Weight for market value / net income"),
    fertilizer_savings_priority: float = Query(0.25, ge=0, le=1, description="Weight for fertilizer savings"),
    faw_disruption_priority: float = Query(0.20, ge=0, le=1, description="Weight for FAW pest disruption"),
    drought_resilience_priority: float = Query(0.20, ge=0, le=1, description="Weight for drought resilience"),
):
    """Convenience GET endpoint for predicting crop rotations with query parameters."""
    req = CropRotationRequest(
        soil_type=soil_type,
        current_crop=current_crop,
        farm_size_hectares=farm_size_hectares,
        target_season=target_season,
        market_priority=market_priority,
        fertilizer_savings_priority=fertilizer_savings_priority,
        faw_disruption_priority=faw_disruption_priority,
        drought_resilience_priority=drought_resilience_priority,
    )
    return ml_engine.predict_rotations(req)

@router.post("/tradeoffs", response_model=TradeoffResponse, summary="Multi-Objective Agronomic Tradeoffs")
def evaluate_tradeoffs(request: TradeoffRequest):
    """
    Quantifies multi-dimensional agronomic tradeoffs between rotation practices
    (Net Income vs Fertilizer Cost Reduction vs Fall Armyworm Disruption vs Drought Resilience).
    """
    try:
        return ml_engine.evaluate_tradeoffs(request)
    except Exception as e:
        logger.exception("Error evaluating tradeoffs")
        raise HTTPException(status_code=500, detail=f"Tradeoff evaluation error: {str(e)}")

@router.get("/tradeoffs", response_model=TradeoffResponse, summary="Multi-Objective Agronomic Tradeoffs (GET shortcut)")
def get_tradeoffs(
    current_crop: str = Query("Maize", description="Baseline crop"),
    soil_type: str = Query("Sandy Loam", description="Soil type"),
    target_season: str = Query("Major Rainy Season", description="Planting season"),
):
    """Convenience GET endpoint for evaluating tradeoffs with default weights."""
    req = TradeoffRequest(
        current_crop=current_crop,
        soil_type=soil_type,
        target_season=target_season,
    )
    return ml_engine.evaluate_tradeoffs(req)

@router.get("/environmental-profile", response_model=EnvironmentalProfileResponse, summary="10-Year Decadal Environmental Profile")
def get_environmental_profile():
    """
    Returns decadal environmental statistics and 12-month climatology extracted directly
    from Space2Soil processed NASA datasets for Ejura Sekyedumasi.
    """
    summary = data_loader.get_decadal_summary()
    monthly = data_loader.get_monthly_climatology()
    
    return EnvironmentalProfileResponse(
        location={
            "region": settings.PILOT_REGION,
            "latitude": settings.PILOT_LATITUDE,
            "longitude": settings.PILOT_LONGITUDE,
            "agro_ecological_zone": settings.PILOT_ECOLOGICAL_ZONE,
            "elevation_approx_m": 220,
        },
        decadal_summary=summary,
        rainfall_stats={
            "mission": "NASA GPM IMERG (10 km)",
            "decadal_total_rainfall_mm": summary["total_rainfall_mm"],
            "annual_average_rainfall_mm": summary["annual_mean_rainfall_mm"],
            "variability_cv": summary["rainfall_variability_cv"],
            "heavy_rain_days_ge_25mm": summary["heavy_rain_days_count"],
            "extreme_rain_days_ge_50mm": summary["extreme_rain_days_count"],
        },
        climate_stats={
            "mission": "NASA POWER / MERRA-2 (~50 km)",
            "heat_stress_threshold_c": 35.0,
            "total_heat_stress_days": summary["heat_stress_days_count"],
            "heat_stress_pct": summary["heat_stress_frequency_pct"],
        },
        soil_moisture_stats={
            "mission": "NASA SMAP / GMAO (9 km)",
            "mean_surface_wetness_0_5cm": summary["mean_surface_soil_wetness_fraction"],
            "mean_rootzone_wetness_0_100cm": summary["mean_rootzone_soil_wetness_fraction"],
            "agricultural_drought_days": summary["agricultural_drought_days_count"],
            "drought_anomalies_cataloged": summary["drought_events_cataloged"],
        },
        vegetation_stats={
            "mission": "Landsat 8 & 9 C2 L2 (30 m)",
            "mean_decadal_ndvi": summary["mean_landsat_ndvi"],
            "major_season_peak_ndvi": 0.74,
            "harmattan_dry_fallow_ndvi": 0.28,
        },
        monthly_climatology=monthly,
    )

@router.get("/pilot-data", response_model=PilotDataResponse, summary="Ejura Pilot Study & Ag Context")
def get_pilot_data():
    """
    Returns ground-truth pilot characteristics, MOFA agricultural baseline,
    monoculture statistics, and NASA mission specifications.
    """
    return PilotDataResponse(
        region_name=settings.PILOT_REGION,
        coordinates={"latitude": settings.PILOT_LATITUDE, "longitude": settings.PILOT_LONGITUDE},
        agro_ecological_zone=settings.PILOT_ECOLOGICAL_ZONE,
        baseline_monoculture_pct=88.0,
        dominant_crops=[
            "Maize (Dominant Staple Cereal)",
            "Cowpea (Drought-Resilient Legume)",
            "Groundnut (Cash Oilseed & Nitrogen Fixer)",
            "Yam (Premier Tuber Cash Crop)",
            "Cassava (Resilient Food Reserve)",
            "Rice (Upland & Valley Grain)",
            "Pigeon Pea (Cover Crop & Biological Armor)",
            "Soybean (Protein Legume)",
        ],
        challenges=[
            "Continuous maize monoculture (88% of cultivated acreage) causing synthetic fertilizer dependency",
            "Severe Fall Armyworm (Spodoptera frugiperda) outbreaks perpetuating across unbroken cereal seasons",
            "Erratic rainfall onset and mid-season dry spells during maize silking/tasseling",
            "Rapid dry Harmattan transition terminating minor season prematurely",
            "High chemical input costs (NPK fertilizer & synthetic insecticides)",
        ],
        nasa_missions=[
            {
                "mission_name": "NASA POWER / MERRA-2",
                "scale": "Macro-scale (~50 km)",
                "variables": "T2M, Tmax, Tmin, RH2M, Heat Stress Days (>= 35C), DTR",
                "agronomic_role": "Identifies crop thermal limits and flowering heat stress windows",
            },
            {
                "mission_name": "NASA GPM IMERG",
                "scale": "Meso-scale (10 km)",
                "variables": "Daily precipitation, 7-day & 30-day cumulative rainfall, extremes",
                "agronomic_role": "Guides optimal planting onset and detects flood/waterlogging risks",
            },
            {
                "mission_name": "NASA SMAP / GMAO",
                "scale": "Meso-scale (9 km)",
                "variables": "Surface (0-5cm) & Root-zone (0-100cm) wetness, anomaly z-scores",
                "agronomic_role": "Detects agricultural drought onset before visible crop wilting",
            },
            {
                "mission_name": "Landsat 8 & 9 C2 L2",
                "scale": "Farm-scale (30 m)",
                "variables": "NDVI, EVI, vegetative vigor, canopy cover",
                "agronomic_role": "Tracks parcel-level biomass accumulation and seasonal greenness peaks",
            },
        ],
        seasons={
            "Major Rainy Season": "March/April to July (Primary maize & yam planting window)",
            "Minor Rainy Season": "September to November (Erratic rainfall; ideal for short-cycle cowpea & groundnut)",
            "Dry Harmattan Season": "December to March (Northeasterly dry winds; post-harvest fallow or drought-hardy pigeon pea)",
        }
    )


# ========================================================
# FARMER AUTH & DIGITAL TWIN ENDPOINTS
# ========================================================

@router.post("/auth/register", response_model=DigitalTwinProfile, summary="Register Farmer & Create Digital Twin")
def register_farmer(req: FarmerRegisterRequest):
    """Creates a new farmer profile and initializes their field Digital Twin."""
    try:
        return digital_twin_store.register_farmer(req)
    except Exception as e:
        logger.exception("Error registering farmer")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/auth/login", response_model=DigitalTwinProfile, summary="Login Farmer with Phone & PIN")
def login_farmer(req: FarmerLoginRequest):
    """Authenticates farmer using their phone number and 4-digit PIN."""
    profile = digital_twin_store.login_farmer(req.phone_number, req.pin)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or PIN. For demo access, use phone 0241234567 and PIN 1234."
        )
    return profile

@router.get("/farmers/{phone}/digital-twin", response_model=DigitalTwinProfile, summary="Get Farmer Digital Twin")
def get_farmer_digital_twin(phone: str):
    """Retrieves farmer digital twin by phone number."""
    profile = digital_twin_store.get_profile(phone)
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")
    return profile

@router.put("/farmers/{phone}/digital-twin", response_model=DigitalTwinProfile, summary="Update Digital Twin Profile")
def update_farmer_digital_twin(phone: str, req: DigitalTwinUpdateRequest):
    """Updates farmer field variables, soil type, crops, or land usage."""
    profile = digital_twin_store.update_profile(phone, req)
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")
    return profile

@router.post("/farmers/{phone}/custom-crops", response_model=DigitalTwinProfile, summary="Add Custom Farmer Crop")
def add_custom_crop(phone: str, req: AddCustomCropRequest):
    """Adds a newly specified crop to the farmer's Digital Twin cultivated crops inventory."""
    profile = digital_twin_store.add_custom_crop(phone, req.crop_name)
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")
    return profile

@router.post("/farmers/{phone}/record-gps", response_model=DigitalTwinProfile, summary="Record Exact On-Farm GPS")
def record_on_farm_gps(phone: str, req: RecordGPSRequest):
    """Updates farmer coordinates with exact live GPS location taken on the farm."""
    profile = digital_twin_store.record_gps(phone, req.latitude, req.longitude, req.accuracy_meters, req.recorded_on_farm)
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")
    return profile

# ========================================================
# CROP FEASIBILITY & ADVISORY EVALUATION
# ========================================================

@router.post("/feasibility/evaluate", response_model=CropFeasibilityResponse, summary="Evaluate Crop Feasibility & Recommendations")
def evaluate_crop_feasibility(req: CropFeasibilityRequest):
    """
    Evaluates whether the farmer's proposed crop matches their field history,
    soil type, and decadal NASA weather. Returns approval verdict and up to 3 recommendations (max 3).
    Automatically syncs changes to the farmer's Digital Twin if phone number is provided.
    """
    try:
        res = ml_engine.evaluate_crop_feasibility(req)
        
        # If phone provided, auto-sync to Digital Twin
        if req.phone_number:
            sync_update = DigitalTwinUpdateRequest(
                soil_type=req.soil_type,
                latitude=req.latitude,
                longitude=req.longitude,
                gps_recorded_on_farm=req.gps_recorded_on_farm,
                farm_size_hectares=req.farm_size_hectares,
                crop_in_mind=req.crop_in_mind,
                target_season=req.target_season,
            )
            digital_twin_store.update_profile(req.phone_number, sync_update)

        return res
    except Exception as e:
        logger.exception("Error evaluating crop feasibility")
        raise HTTPException(status_code=500, detail=f"Feasibility evaluation failed: {str(e)}")
