"""
Unit tests for AgroHelp ML Crop Rotation & Tradeoff Engine.
"""

import pytest
from app.ml.engine import ml_engine
from app.schemas.models import CropRotationRequest, TradeoffRequest

def test_engine_initialization():
    assert ml_engine.model_info is not None
    assert "model" in ml_engine.model_info
    assert len(ml_engine.model_info["features"]) == 14

def test_predict_rotations_default():
    req = CropRotationRequest(
        soil_type="Sandy Loam",
        current_crop="Maize",
        farm_size_hectares=2.5,
        target_season="Major Rainy Season",
        market_priority=0.25,
        fertilizer_savings_priority=0.25,
        faw_disruption_priority=0.25,
        drought_resilience_priority=0.25,
    )
    res = ml_engine.predict_rotations(req)
    
    assert res.pilot_region != ""
    assert res.current_crop == "Maize"
    assert len(res.recommendations) > 0
    
    # Check ranking order
    scores = [r.suitability_score for r in res.recommendations]
    assert scores == sorted(scores, reverse=True)
    
    # Ensure rankings are sequential 1, 2, ...
    assert res.recommendations[0].rank == 1

def test_dynamic_priority_shifting():
    """Verify that predictions dynamically change when farmer priorities change."""
    # Priority 1: High Fall Armyworm disruption
    req_faw = CropRotationRequest(
        soil_type="Sandy Loam",
        current_crop="Maize",
        market_priority=0.05,
        fertilizer_savings_priority=0.05,
        faw_disruption_priority=0.85,
        drought_resilience_priority=0.05,
    )
    res_faw = ml_engine.predict_rotations(req_faw)
    top_faw_crop = res_faw.recommendations[0].crop_name
    
    # Priority 2: High Market Income
    req_income = CropRotationRequest(
        soil_type="Sandy Loam",
        current_crop="Maize",
        market_priority=0.85,
        fertilizer_savings_priority=0.05,
        faw_disruption_priority=0.05,
        drought_resilience_priority=0.05,
    )
    res_income = ml_engine.predict_rotations(req_income)
    
    # Monoculture maize should have a low FAW score
    maize_rec = next(r for r in res_faw.recommendations if r.crop_name == "Maize")
    cowpea_rec = next(r for r in res_faw.recommendations if r.crop_name == "Cowpea")
    
    assert cowpea_rec.faw_disruption_score > maize_rec.faw_disruption_score
    assert cowpea_rec.fertilizer_reduction_pct > maize_rec.fertilizer_reduction_pct
    assert res_faw.recommendations[0].suitability_score != res_income.recommendations[0].suitability_score

def test_tradeoff_evaluation():
    req = TradeoffRequest(
        current_crop="Maize",
        soil_type="Sandy Loam",
        target_season="Major Rainy Season",
    )
    res = ml_engine.evaluate_tradeoffs(req)
    
    assert len(res.tradeoff_matrix) > 0
    assert len(res.pareto_candidates) > 0
    assert len(res.strategies) >= 3
    assert len(res.radar_indicators) == 5
    assert "monoculture_baseline_faw_score" in res.benchmarks
