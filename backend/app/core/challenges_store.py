"""
Farmer Challenges Store & Global Threat Detection Engine.
Persists crowdsourced farmer challenge reports in JSON and clusters them
to detect whether an agricultural problem is local, regional, or global.
"""

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.schemas.challenges import (
    ChallengeCreateRequest,
    ChallengeRecord,
    ThreatCluster,
    ChallengesListResponse,
)

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
CHALLENGES_FILE = os.path.join(DATA_DIR, "farmer_challenges.json")

class ChallengesStore:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self._ensure_database()

    def _ensure_database(self):
        """Ensures the JSON database exists, initializing with baseline seed reports if empty."""
        if not os.path.exists(CHALLENGES_FILE):
            seeds = self._get_initial_seeds()
            self._save_raw(seeds)

    def _get_initial_seeds(self) -> List[Dict[str, Any]]:
        """Pre-seeds realistic crowdsourced challenges across Africa to demonstrate global clustering."""
        return [
            {
                "challenge_id": "seed-001",
                "farmer_name": "Kwabena Mensah",
                "phone_number": "0241002001",
                "country": "Ghana",
                "town": "Ejura Central",
                "latitude": 7.3856,
                "longitude": -1.3562,
                "crop_affected": "Maize",
                "challenge_type": "Pest Outbreak",
                "description": "Fall Armyworm larvae attacked young maize whorls 3 weeks after germination. Synthetic sprays are expensive and losing effectiveness.",
                "severity": "High / Urgent",
                "created_at": "2026-11-14T08:30:00Z",
            },
            {
                "challenge_id": "seed-002",
                "farmer_name": "Ibrahim Danladi",
                "phone_number": "08031234567",
                "country": "Nigeria",
                "town": "Dawanau / Kano",
                "latitude": 12.0667,
                "longitude": 8.4500,
                "crop_affected": "Maize",
                "challenge_type": "Pest Outbreak",
                "description": "Severe armyworm infestation in rainfed maize across several farms. Caterpillars destroying vegetative leaves.",
                "severity": "High / Urgent",
                "created_at": "2026-11-14T11:15:00Z",
            },
            {
                "challenge_id": "seed-003",
                "farmer_name": "Kouassi Yao",
                "phone_number": "0708998877",
                "country": "Côte d'Ivoire",
                "town": "Bouaké",
                "latitude": 7.6900,
                "longitude": -5.0300,
                "crop_affected": "Maize",
                "challenge_type": "Pest Outbreak",
                "description": "Chenilles légionnaires (armyworm) spotted across cereal parcels. Maize fields showing heavy windowpaning damage.",
                "severity": "High / Urgent",
                "created_at": "2026-11-15T09:00:00Z",
            },
            {
                "challenge_id": "seed-004",
                "farmer_name": "Ama Serwaa",
                "phone_number": "0245667788",
                "country": "Ghana",
                "town": "Babaso",
                "latitude": 7.4200,
                "longitude": -1.3100,
                "crop_affected": "Maize",
                "challenge_type": "Drought / Water Stress",
                "description": "Three weeks without rain during minor season grain filling. Maize tassels are drying out prematurely.",
                "severity": "High / Urgent",
                "created_at": "2026-11-15T10:45:00Z",
            },
            {
                "challenge_id": "seed-005",
                "farmer_name": "John Kimani",
                "phone_number": "0722112233",
                "country": "Kenya",
                "town": "Eldoret",
                "latitude": 0.5143,
                "longitude": 35.2698,
                "crop_affected": "Maize",
                "challenge_type": "Input Cost Spikes",
                "description": "Commercial fertilizer prices spiked to over 6,500 KES per 50kg bag. Need alternative organic soil nutrients.",
                "severity": "Moderate",
                "created_at": "2026-11-15T12:00:00Z",
            },
        ]

    def _load_raw(self) -> List[Dict[str, Any]]:
        try:
            with open(CHALLENGES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error("Error reading challenges database: %s", e)
            return []

    def _save_raw(self, data: List[Dict[str, Any]]):
        with open(CHALLENGES_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def add_challenge(self, req: ChallengeCreateRequest) -> ChallengeRecord:
        """Stores a new crowdsourced challenge and computes its threat classification."""
        records = self._load_raw()
        new_id = str(uuid.uuid4())[:8]
        now_iso = datetime.now(timezone.utc).isoformat()

        record_dict = {
            "challenge_id": new_id,
            "farmer_name": req.farmer_name or "Anonymous Farmer",
            "phone_number": req.phone_number,
            "country": req.country,
            "town": req.town,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "crop_affected": req.crop_affected,
            "challenge_type": req.challenge_type,
            "description": req.description,
            "severity": req.severity,
            "created_at": now_iso,
        }

        records.insert(0, record_dict)
        self._save_raw(records)

        # Classify scope
        scope = self._evaluate_threat_scope(record_dict, records)
        record_dict["threat_scope"] = scope
        return ChallengeRecord(**record_dict)

    def get_challenges_and_alerts(
        self,
        country: Optional[str] = None,
        town: Optional[str] = None,
        crop: Optional[str] = None,
        challenge_type: Optional[str] = None,
    ) -> ChallengesListResponse:
        """Returns all challenges and computes active global/regional threat clusters."""
        raw_list = self._load_raw()

        # Compute clusters across all data
        clusters = self._compute_threat_clusters(raw_list)

        # Filter challenges if requested
        filtered = raw_list
        if country:
            c_low = country.strip().lower()
            filtered = [r for r in filtered if r.get("country", "").lower() == c_low]
        if town:
            t_low = town.strip().lower()
            filtered = [r for r in filtered if t_low in r.get("town", "").lower()]
        if crop:
            cr_low = crop.strip().lower()
            filtered = [r for r in filtered if cr_low in r.get("crop_affected", "").lower()]
        if challenge_type:
            ct_low = challenge_type.strip().lower()
            filtered = [r for r in filtered if ct_low in r.get("challenge_type", "").lower()]

        challenge_records: List[ChallengeRecord] = []
        for r in filtered:
            scope = self._evaluate_threat_scope(r, raw_list)
            r_copy = dict(r)
            r_copy["threat_scope"] = scope
            challenge_records.append(ChallengeRecord(**r_copy))

        return ChallengesListResponse(
            total_challenges=len(raw_list),
            active_threat_clusters=clusters,
            challenges=challenge_records,
        )

    def _evaluate_threat_scope(self, target: Dict[str, Any], all_records: List[Dict[str, Any]]) -> str:
        """Determines if a challenge is isolated, regional, or a cross-border/global threat."""
        crop = target.get("crop_affected", "").lower()
        c_type = target.get("challenge_type", "").lower()

        matching = [
            r for r in all_records
            if r.get("crop_affected", "").lower() == crop and r.get("challenge_type", "").lower() == c_type
        ]

        countries = set(r.get("country", "") for r in matching if r.get("country"))
        towns = set(r.get("town", "") for r in matching if r.get("town"))

        if len(countries) >= 2:
            return "Cross-Border / Global Threat"
        elif len(towns) >= 2:
            return "Regional Alert"
        return "Local Watch"

    def _compute_threat_clusters(self, all_records: List[Dict[str, Any]]) -> List[ThreatCluster]:
        """Clusters problems across geography to alert farmers of emerging global or regional crises."""
        grouped: Dict[tuple, List[Dict[str, Any]]] = {}

        for r in all_records:
            key = (r.get("crop_affected", "General"), r.get("challenge_type", "General"))
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(r)

        clusters: List[ThreatCluster] = []
        for (crop, c_type), items in grouped.items():
            countries = sorted(list(set(r.get("country", "") for r in items if r.get("country"))))
            towns = sorted(list(set(r.get("town", "") for r in items if r.get("town"))))
            total = len(items)

            if len(countries) >= 2:
                level = "Global Threat"
                advisory = (
                    f"CRITICAL: {c_type} on {crop} has been reported in {len(countries)} different countries "
                    f"({', '.join(countries)}). This is an active cross-border epidemic. Farmers are advised to "
                    f"adopt biological rotation barriers (e.g. non-host legumes) immediately."
                )
            elif len(towns) >= 2:
                level = "Regional Alert"
                advisory = (
                    f"REGIONAL ALERT: {c_type} on {crop} reported across multiple communities ({', '.join(towns[:3])}). "
                    f"Monitor fields closely and alert agricultural extension officers."
                )
            else:
                level = "Local Watch"
                advisory = f"Local observation of {c_type} on {crop}. Standard preventive measures recommended."

            clusters.append(ThreatCluster(
                crop_affected=crop,
                challenge_type=c_type,
                total_reports=total,
                countries_affected=countries,
                towns_affected=towns,
                threat_level=level,
                summary_advisory=advisory,
            ))

        # Sort with Global Threats first
        severity_order = {"Global Threat": 0, "Regional Alert": 1, "Local Watch": 2}
        clusters.sort(key=lambda x: (severity_order.get(x.threat_level, 3), -x.total_reports))
        return clusters

# Singleton instance
challenges_store = ChallengesStore()
