"""
Unit tests for African Regional Market & Crop Intelligence (FAOSTAT / FPMA).
"""

from fastapi.testclient import TestClient
from app.main import app
from app.core.market_service import market_service

client = TestClient(app)

def test_market_service_countries():
    countries = market_service.get_supported_countries()
    assert len(countries) >= 5
    country_names = [c["country"] for c in countries]
    assert "Ghana" in country_names
    assert "Nigeria" in country_names
    assert "Côte d'Ivoire" in country_names
    assert "Kenya" in country_names

def test_market_service_ghana_markets():
    gh_markets = market_service.get_markets(country="Ghana")
    assert len(gh_markets) >= 3
    ids = [m.market_id for m in gh_markets]
    assert "gh-ejura" in ids
    assert "gh-techiman" in ids

def test_market_service_crop_filter():
    maize_markets = market_service.get_markets(crop_query="Maize")
    assert len(maize_markets) >= 4
    for m in maize_markets:
        crops = [p.crop_name.lower() for p in m.produce_list]
        assert any("maize" in c for c in crops)

def test_market_service_price_comparison():
    res = market_service.compare_prices(crop_names=["Maize", "Cowpea"])
    assert len(res.comparisons) > 0
    assert "Maize" in res.crops_compared or "Cowpea" in res.crops_compared

def test_api_market_countries():
    res = client.get("/api/v1/market-intelligence/countries")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert any(c["country"] == "Ghana" for c in data)

def test_api_market_query():
    res = client.get("/api/v1/market-intelligence/markets?country=Nigeria")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2
    assert any("Dawanau" in m["market_name"] for m in data)

def test_api_market_comparison():
    res = client.get("/api/v1/market-intelligence/compare?crops=Cowpea")
    assert res.status_code == 200
    data = res.json()
    assert "comparisons" in data
    assert len(data["comparisons"]) > 0
