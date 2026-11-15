"""
Pydantic schemas for Farmer Challenges, Crowdsourced Field Intelligence,
and Cross-Border / Global Threat Detection.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ChallengeCreateRequest(BaseModel):
    farmer_name: Optional[str] = Field(default="Anonymous Farmer", description="Name or pseudonym of farmer")
    phone_number: Optional[str] = Field(default=None, description="Optional phone number for contact")
    country: str = Field(default="Ghana", description="Country of report")
    town: str = Field(default="Local Farm", description="Town, village, or community")
    latitude: float = Field(default=7.3856, description="GPS Latitude")
    longitude: float = Field(default=-1.3562, description="GPS Longitude")
    crop_affected: str = Field(..., description="Crop affected: Maize, Cowpea, Cassava, Yam, etc.")
    challenge_type: str = Field(..., description="Category: Pest Outbreak, Drought / Water Stress, Soil Depletion, Input Cost Spikes, Extreme Weather, Disease / Blight")
    description: str = Field(..., description="Detailed description of the challenge in the farmer's own words")
    severity: str = Field(default="High / Urgent", description="High / Urgent, Moderate, Emerging")

class ChallengeRecord(BaseModel):
    challenge_id: str
    farmer_name: str
    phone_number: Optional[str]
    country: str
    town: str
    latitude: float
    longitude: float
    crop_affected: str
    challenge_type: str
    description: str
    severity: str
    created_at: str
    threat_scope: str # "Local", "Regional Alert", "Cross-Border / Global Threat"

class ThreatCluster(BaseModel):
    crop_affected: str
    challenge_type: str
    total_reports: int
    countries_affected: List[str]
    towns_affected: List[str]
    threat_level: str # "Global Threat", "Regional Alert", "Local Watch"
    summary_advisory: str

class ChallengesListResponse(BaseModel):
    total_challenges: int
    active_threat_clusters: List[ThreatCluster]
    challenges: List[ChallengeRecord]
