from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class LocationHierarchy(BaseModel):
    country: str = Field(default="Ghana", description="Country name")
    region: str = Field(default="Ashanti", description="Region name")
    district: str = Field(default="Ejura-Sekyedumase", description="District name")
    community: Optional[str] = Field(default="Ejura", description="Town or community name")

class FarmerRegisterRequest(BaseModel):
    phone_number: str = Field(..., description="Farmer Ghanaian phone number (e.g. 024XXXXXXX)")
    pin: str = Field(..., min_length=4, max_length=4, description="4-digit security PIN")
    full_name: str = Field(..., description="Farmer full name")
    location: LocationHierarchy = Field(default_factory=LocationHierarchy)
    farm_size_hectares: float = Field(default=2.0, gt=0)
    soil_type: str = Field(default="Sandy Loam")
    cultivated_crops: List[str] = Field(default_factory=lambda: ["Maize", "Cassava", "Cowpea"])

class FarmerLoginRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number")
    pin: str = Field(..., min_length=4, max_length=4, description="4-digit PIN")

class FarmUsageHistory(BaseModel):
    monocropping_seasons: int = Field(default=2, ge=0, description="Seasons previously planted with same crop")
    fertilizer_used: str = Field(default="Chemical NPK", description="Type of fertilizer: Chemical NPK, Animal Manure, None")
    armyworm_attacks: bool = Field(default=True, description="Whether Fall Armyworm attacked this field recently")
    water_source: str = Field(default="Rainfed", description="Water supply: Rainfed, Stream/Valley, Hand watering")

class DigitalTwinProfile(BaseModel):
    farmer_id: str
    phone_number: str
    full_name: str
    location: LocationHierarchy
    latitude: float = Field(default=7.3856)
    longitude: float = Field(default=-1.3562)
    gps_recorded_on_farm: bool = Field(default=False)
    gps_accuracy_meters: Optional[float] = None
    farm_size_hectares: float = Field(default=2.0)
    soil_type: str = Field(default="Sandy Loam")
    cultivated_crops: List[str] = Field(default_factory=lambda: ["Maize", "Cassava", "Cowpea"])
    custom_crops: List[str] = Field(default_factory=list)
    farm_usage: FarmUsageHistory = Field(default_factory=FarmUsageHistory)
    crop_in_mind: Optional[str] = None
    target_season: str = Field(default="Major Rainy Season")
    created_at: str
    updated_at: str

class DigitalTwinUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    location: Optional[LocationHierarchy] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gps_recorded_on_farm: Optional[bool] = None
    gps_accuracy_meters: Optional[float] = None
    farm_size_hectares: Optional[float] = None
    soil_type: Optional[str] = None
    cultivated_crops: Optional[List[str]] = None
    custom_crops: Optional[List[str]] = None
    farm_usage: Optional[FarmUsageHistory] = None
    crop_in_mind: Optional[str] = None
    target_season: Optional[str] = None

class AddCustomCropRequest(BaseModel):
    crop_name: str = Field(..., min_length=2, max_length=50)

class RecordGPSRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy_meters: Optional[float] = None
    recorded_on_farm: bool = True

class CropFeasibilityRequest(BaseModel):
    phone_number: Optional[str] = None
    crop_in_mind: Optional[str] = Field(default=None, description="Proposed crop farmer wants to plant, or None if undecided")
    current_crop: str = Field(default="Maize", description="Current or baseline standing crop")
    soil_type: str = Field(default="Sandy Loam", description="Soil texture")
    target_season: str = Field(default="Major Rainy Season", description="Upcoming season")
    farm_size_hectares: float = Field(default=2.0, gt=0)
    latitude: float = Field(default=7.3856)
    longitude: float = Field(default=-1.3562)
    gps_recorded_on_farm: bool = Field(default=False)
    monocropping_seasons: int = Field(default=2)
    fertilizer_used: str = Field(default="Chemical NPK")
    armyworm_attacks: bool = Field(default=True)
    custom_crops: Optional[List[str]] = None

class FeasibilityVerdict(BaseModel):
    crop_name: str
    is_approved: bool
    status_code: str  # "APPROVED", "RISKY_MONOCULTURE", "HIGH_PEST_RISK", "WATER_DEFICIT", "UNSUITABLE_SOIL"
    verdict_badge: str
    verdict_headline: str
    explanation: str
    reasons: List[str]
    agronomic_guidance: str
    confidence_score: float

class CropFeasibilityResponse(BaseModel):
    has_crop_in_mind: bool
    farmer_crop: Optional[str] = None
    verdict: Optional[FeasibilityVerdict] = None
    recommendations: List[Any]  # Maximum of 3 recommendations
    digital_twin_synced: bool = True
    environmental_context: Dict[str, Any]
    timestamp: str
