"""
Persistent Digital Twin Store for AgroHelp.
Maintains farmer profiles, location hierarchy, live GPS logs, cultivated crops,
and farm management history in a resilient JSON file store.
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from pathlib import Path

from app.schemas.farmer import (
    DigitalTwinProfile,
    FarmerRegisterRequest,
    DigitalTwinUpdateRequest,
    LocationHierarchy,
    FarmUsageHistory,
)

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
STORE_FILE = DATA_DIR / "digital_twins.json"

class DigitalTwinStore:
    def __init__(self):
        self._twins: Dict[str, Dict[str, Any]] = {}
        self._pins: Dict[str, str] = {}
        self._ensure_storage()
        self._load()

    def _ensure_storage(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not STORE_FILE.exists():
            # Seed demo farmer: Kofi Mensah (Ejura-Sekyedumase)
            demo_now = datetime.now(timezone.utc).isoformat()
            initial_data = {
                "twins": {
                    "0241234567": {
                        "farmer_id": "0241234567",
                        "phone_number": "0241234567",
                        "full_name": "Kofi Mensah",
                        "location": {
                            "country": "Ghana",
                            "region": "Ashanti",
                            "district": "Ejura-Sekyedumase",
                            "community": "Ejura Central"
                        },
                        "latitude": 7.3856,
                        "longitude": -1.3562,
                        "gps_recorded_on_farm": True,
                        "gps_accuracy_meters": 4.5,
                        "farm_size_hectares": 2.0,
                        "soil_type": "Sandy Loam",
                        "cultivated_crops": ["Maize", "Cassava", "Cowpea"],
                        "custom_crops": ["Plantain", "Pepper"],
                        "farm_usage": {
                            "monocropping_seasons": 2,
                            "fertilizer_used": "Chemical NPK",
                            "armyworm_attacks": True,
                            "water_source": "Rainfed"
                        },
                        "crop_in_mind": "Maize",
                        "target_season": "Major Rainy Season",
                        "created_at": demo_now,
                        "updated_at": demo_now
                    }
                },
                "pins": {
                    "0241234567": "1234"
                }
            }
            with open(STORE_FILE, "w", encoding="utf-8") as f:
                json.dump(initial_data, f, indent=2)

    def _load(self):
        try:
            with open(STORE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._twins = data.get("twins", {})
                self._pins = data.get("pins", {})
                logger.info(f"Loaded {len(self._twins)} digital twins from {STORE_FILE}")
        except Exception as e:
            logger.error(f"Error loading digital twins: {e}")
            self._twins = {}
            self._pins = {}

    def _save(self):
        try:
            with open(STORE_FILE, "w", encoding="utf-8") as f:
                json.dump({"twins": self._twins, "pins": self._pins}, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving digital twins: {e}")

    def register_farmer(self, req: FarmerRegisterRequest) -> DigitalTwinProfile:
        phone = req.phone_number.strip()
        now_str = datetime.now(timezone.utc).isoformat()
        
        # Merge default cultivated crops
        all_crops = list(dict.fromkeys(req.cultivated_crops))
        
        twin_data = {
            "farmer_id": phone,
            "phone_number": phone,
            "full_name": req.full_name.strip(),
            "location": req.location.model_dump(),
            "latitude": 7.3856,
            "longitude": -1.3562,
            "gps_recorded_on_farm": False,
            "gps_accuracy_meters": None,
            "farm_size_hectares": req.farm_size_hectares,
            "soil_type": req.soil_type,
            "cultivated_crops": all_crops,
            "custom_crops": [],
            "farm_usage": {
                "monocropping_seasons": 2,
                "fertilizer_used": "Chemical NPK",
                "armyworm_attacks": True,
                "water_source": "Rainfed"
            },
            "crop_in_mind": None,
            "target_season": "Major Rainy Season",
            "created_at": now_str,
            "updated_at": now_str
        }

        self._twins[phone] = twin_data
        self._pins[phone] = req.pin.strip()
        self._save()
        return DigitalTwinProfile(**twin_data)

    def login_farmer(self, phone: str, pin: str) -> Optional[DigitalTwinProfile]:
        phone = phone.strip()
        stored_pin = self._pins.get(phone)
        if stored_pin and stored_pin == pin.strip():
            twin = self._twins.get(phone)
            if twin:
                return DigitalTwinProfile(**twin)
        return None

    def get_profile(self, phone: str) -> Optional[DigitalTwinProfile]:
        phone = phone.strip()
        twin = self._twins.get(phone)
        if twin:
            return DigitalTwinProfile(**twin)
        return None

    def update_profile(self, phone: str, updates: DigitalTwinUpdateRequest) -> Optional[DigitalTwinProfile]:
        phone = phone.strip()
        if phone not in self._twins:
            return None

        twin = self._twins[phone]
        data_to_update = updates.model_dump(exclude_unset=True)
        
        for k, v in data_to_update.items():
            if v is not None:
                twin[k] = v

        twin["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._twins[phone] = twin
        self._save()
        return DigitalTwinProfile(**twin)

    def add_custom_crop(self, phone: str, crop_name: str) -> Optional[DigitalTwinProfile]:
        phone = phone.strip()
        if phone not in self._twins:
            return None

        clean_crop = crop_name.strip().title()
        twin = self._twins[phone]
        
        custom_crops = twin.get("custom_crops", [])
        if clean_crop not in custom_crops:
            custom_crops.append(clean_crop)
            twin["custom_crops"] = custom_crops

        cultivated_crops = twin.get("cultivated_crops", [])
        if clean_crop not in cultivated_crops:
            cultivated_crops.append(clean_crop)
            twin["cultivated_crops"] = cultivated_crops

        twin["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._save()
        return DigitalTwinProfile(**twin)

    def record_gps(self, phone: str, lat: float, lon: float, accuracy: Optional[float], on_farm: bool) -> Optional[DigitalTwinProfile]:
        phone = phone.strip()
        if phone not in self._twins:
            return None

        twin = self._twins[phone]
        twin["latitude"] = round(lat, 5)
        twin["longitude"] = round(lon, 5)
        twin["gps_accuracy_meters"] = round(accuracy, 1) if accuracy is not None else None
        twin["gps_recorded_on_farm"] = on_farm
        twin["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._save()
        return DigitalTwinProfile(**twin)

# Global singleton store
digital_twin_store = DigitalTwinStore()
