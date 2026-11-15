"""
Tests for Farmer Crowdsourced Challenges & Global Threat Detection.
"""

from fastapi.testclient import TestClient
from app.main import app
from app.core.challenges_store import challenges_store
from app.core.telemetry_calculator import calculate_location_telemetry

client = TestClient(app)

def test_telemetry_calculator_kano_nigeria():
    # Kano, Nigeria: ~12.06 N, 8.45 E
    profile = calculate_location_telemetry(12.06, 8.45, "Nigeria", "Kano")
    assert profile["location"]["country"] == "Nigeria"
    assert "Sudan" in profile["location"]["agro_ecological_zone"] or "Sahel" in profile["location"]["agro_ecological_zone"]
    assert len(profile["monthly_climatology"]) == 12

def test_telemetry_calculator_kenya_highlands():
    # Eldoret, Kenya: ~0.51 N, 35.26 E
    profile = calculate_location_telemetry(0.51, 35.26, "Kenya", "Eldoret")
    assert profile["location"]["country"] == "Kenya"
    assert "Highland" in profile["location"]["agro_ecological_zone"]
    assert profile["location"]["elevation_approx_m"] > 1500

def test_dynamic_environmental_profile_endpoint():
    res = client.get("/api/v1/environmental-profile?latitude=12.06&longitude=8.45&country=Nigeria&town=Kano")
    assert res.status_code == 200
    data = res.json()
    assert data["location"]["country"] == "Nigeria"
    assert data["location"]["town"] == "Kano"

def test_submit_challenge_and_threat_clustering():
    payload = {
        "farmer_name": "Test Farmer",
        "phone_number": "0200000000",
        "country": "Ghana",
        "town": "Kasei",
        "latitude": 7.39,
        "longitude": -1.35,
        "crop_affected": "Maize",
        "challenge_type": "Pest Outbreak",
        "description": "Armyworms attacking second season crop.",
        "severity": "High / Urgent",
    }
    res = client.post("/api/v1/challenges", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["challenge_id"] is not None
    assert data["crop_affected"] == "Maize"

    # Get challenges and check threat clusters
    get_res = client.get("/api/v1/challenges")
    assert get_res.status_code == 200
    cluster_data = get_res.json()
    assert cluster_data["total_challenges"] >= 5
    assert len(cluster_data["active_threat_clusters"]) > 0
    # Maize + Pest Outbreak was reported in Ghana, Nigeria, and Ivory Coast -> Global Threat!
    global_clusters = [c for c in cluster_data["active_threat_clusters"] if c["threat_level"] == "Global Threat"]
    assert len(global_clusters) > 0
