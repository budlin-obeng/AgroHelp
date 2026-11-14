"""
Integration tests for FastAPI REST endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "AgroHelp" in data["message"]
    assert "pilot_region" in data

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["data_loaded"] is True
    assert data["data_records"]["climate_daily"] >= 3650

def test_health_v1():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_pilot_data():
    response = client.get("/api/v1/pilot-data")
    assert response.status_code == 200
    data = response.json()
    assert "Ejura" in data["region_name"]
    assert data["baseline_monoculture_pct"] == 88.0
    assert len(data["nasa_missions"]) == 4
    assert len(data["dominant_crops"]) > 0

def test_environmental_profile():
    response = client.get("/api/v1/environmental-profile")
    assert response.status_code == 200
    data = response.json()
    assert "location" in data
    assert "decadal_summary" in data
    assert data["decadal_summary"]["total_rainfall_mm"] > 10000
    assert len(data["monthly_climatology"]) == 12

def test_predict_rotations_post():
    payload = {
        "soil_type": "Sandy Loam",
        "current_crop": "Maize",
        "farm_size_hectares": 3.0,
        "target_season": "Major Rainy Season",
        "market_priority": 0.40,
        "fertilizer_savings_priority": 0.30,
        "faw_disruption_priority": 0.15,
        "drought_resilience_priority": 0.15,
    }
    response = client.post("/api/v1/predict-rotations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["current_crop"] == "Maize"
    assert len(data["recommendations"]) > 0
    top = data["recommendations"][0]
    assert "suitability_score" in top
    assert "faw_disruption_score" in top
    assert "predicted_yield_tons_ha" in top
    assert "expected_gross_margin_ghs_ha" in top

def test_predict_rotations_get():
    response = client.get("/api/v1/predict-rotations?soil_type=Sandy+Loam&current_crop=Maize")
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0

def test_tradeoffs_post():
    payload = {
        "current_crop": "Maize",
        "soil_type": "Sandy Loam",
        "target_season": "Major Rainy Season",
        "weights": {
            "market": 0.35,
            "fertilizer": 0.25,
            "faw": 0.20,
            "drought": 0.20
        }
    }
    response = client.post("/api/v1/tradeoffs", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["tradeoff_matrix"]) > 0
    assert len(data["pareto_candidates"]) > 0
    assert len(data["strategies"]) >= 3

def test_tradeoffs_get():
    response = client.get("/api/v1/tradeoffs")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tradeoff_matrix"]) > 0
