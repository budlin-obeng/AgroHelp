"""
Unit tests for Space2Soil NASA Data Loader.
"""

import pytest
from app.core.data_loader import data_loader

def test_data_loader_is_loaded():
    assert data_loader.is_loaded is True
    counts = data_loader.get_record_counts()
    assert counts["climate_daily"] >= 3650
    assert counts["rainfall_daily"] >= 3650
    assert counts["soil_daily"] >= 3650
    assert counts["drought_events"] > 0
    assert counts["vegetation_monthly"] > 0

def test_decadal_summary():
    summary = data_loader.get_decadal_summary()
    assert summary["total_observed_days"] >= 3650
    assert summary["total_rainfall_mm"] > 10000.0
    assert summary["annual_mean_rainfall_mm"] > 1000.0
    assert summary["heat_stress_days_count"] > 100
    assert summary["mean_surface_soil_wetness_fraction"] > 0.3
    assert summary["mean_rootzone_soil_wetness_fraction"] > 0.3
    assert summary["mean_landsat_ndvi"] > 0.2

def test_seasonal_features():
    major = data_loader.get_seasonal_features("Major Rainy Season")
    minor = data_loader.get_seasonal_features("Minor Rainy Season")
    harmattan = data_loader.get_seasonal_features("Dry Harmattan Season")
    
    assert major["seasonal_rainfall_mm"] > 0
    assert minor["seasonal_rainfall_mm"] > 0
    assert harmattan["seasonal_rainfall_mm"] >= 0
    
    # Harmattan has lower rainfall and lower reliability than major rainy season
    assert major["seasonal_rainfall_mm"] > harmattan["seasonal_rainfall_mm"]
    assert major["rainfall_reliability_index"] > harmattan["rainfall_reliability_index"]

def test_monthly_climatology():
    monthly = data_loader.get_monthly_climatology()
    assert len(monthly) == 12
    for m in monthly:
        assert 1 <= m["month_num"] <= 12
        assert "month_name" in m
        assert m["rainfall_mm"] >= 0
        assert m["temperature_mean_c"] > 15
        assert m["ndvi"] >= 0.1
