# 05. AgroHelp REST API Specification

**Base URL:** `http://localhost:8000` (or `http://127.0.0.1:8000`)  
**Prefix:** `/api/v1`  
**Interactive Swagger Docs:** `http://localhost:8000/docs`  
**ReDoc Specification:** `http://localhost:8000/redoc`

---

## Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status, model type, and loaded dataset records count |
| `GET` | `/api/v1/pilot-data` | Decadal summary of Ejura pilot (climate, rainfall, soil moisture, NDVI) |
| `GET` | `/api/v1/environmental-profile` | Live or cached NASA agroclimatology indicators for coordinates |
| `POST` | `/api/v1/predict-rotations` | Runs ML engine to predict ranked crop rotation scenarios |
| `POST` | `/api/v1/tradeoffs` | Evaluates multi-dimensional trade-offs between cropping options |

---

## 1. `POST /api/v1/predict-rotations`

Generates dynamic machine-learning crop rotation predictions based on farm profile and farmer priorities.

### Request Body
```json
{
  "soil_type": "Sandy Loam",
  "current_crop": "Maize",
  "farm_size_hectares": 2.5,
  "target_season": "Major Rainy Season",
  "market_priority": 0.35,
  "fertilizer_savings_priority": 0.25,
  "faw_disruption_priority": 0.20,
  "drought_resilience_priority": 0.20
}
```

### Response (`200 OK`)
```json
{
  "pilot_region": "Ejura-Sekyedumase, Ashanti Region, Ghana",
  "model_type": "MultiOutput GradientBoosting ML Regressor",
  "is_external_model": false,
  "input_summary": {
    "standing_crop": "Maize",
    "soil_type": "Sandy Loam",
    "farm_size_ha": 2.5
  },
  "priorities_applied": {
    "market_income": 0.35,
    "fertilizer_savings": 0.25,
    "faw_disruption": 0.2,
    "drought_resilience": 0.2
  },
  "recommended_rotations": [
    {
      "rank": 1,
      "scenario_id": "scenario_cowpea_shield",
      "name": "Maize → Cowpea Biological Shield",
      "cropping_sequence": "Major Season Maize → Minor Season Cowpea",
      "suitability_score": 93.4,
      "expected_gross_margin_ghs": 24850.0,
      "fertilizer_savings_pct": 35.0,
      "faw_disruption_index": 85.0,
      "maturity_days": "Maize (100d) → Cowpea (65d)",
      "drought_risk_level": "Low (65-day short maturity avoids late dry spells)",
      "actionable_guidance": "Sow inoculated cowpeas (Songotra variety) immediately following major season maize harvest to fix nitrogen and starve armyworm larvae.",
      "tradeoffs": {
        "advantages": ["Fixes 45-70 kg N/ha", "85% Fall Armyworm larval disruption"],
        "tradeoffs": ["Requires dry sunny window for pod drying", "Post-harvest weevil protection needed"]
      }
    }
  ]
}
```

---

## 2. `POST /api/v1/tradeoffs`

Compares the baseline continuous maize monoculture against candidate rotation strategies.

### Request Body
```json
{
  "standing_crop": "Maize",
  "farm_size_ha": 2.0,
  "comparison_candidates": ["Cowpea", "Soybean", "Cassava"]
}
```

### Response (`200 OK`)
```json
{
  "baseline_practice": {
    "name": "Continuous Maize Monoculture",
    "faw_risk": "Severe (Host continuous presence)",
    "net_soil_nitrogen_kg_ha": -75.0,
    "synthetic_fertilizer_cost_ghs": 3200.0,
    "drought_vulnerability": "High"
  },
  "tradeoff_matrix": [
    {
      "candidate": "Cowpea",
      "net_nitrogen_contribution_kg_ha": 55.0,
      "fertilizer_cost_reduction_ghs": 1120.0,
      "faw_disruption_pct": 85.0,
      "ground_cover_duration_months": 10.0,
      "key_tradeoff": "Requires prompt harvesting to avoid pod shattering; excellent short-term nitrogen gain."
    }
  ]
}
```
