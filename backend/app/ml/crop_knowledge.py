"""
Crop agronomic knowledge base and characteristics specifically calibrated
for the Ejura-Sekyedumase agricultural zone in Ashanti Region, Ghana.
"""

from typing import Dict, Any, List

# Comprehensive Crop Database for Ejura
CROP_DATABASE: Dict[str, Dict[str, Any]] = {
    "Cowpea": {
        "scientific_name": "Vigna unguiculata",
        "family": "Legume (Nitrogen Fixer)",
        "maturity_days_min": 60,
        "maturity_days_max": 75,
        "optimal_rainfall_mm_min": 350,
        "optimal_rainfall_mm_max": 700,
        "drought_tolerance_rating": 90,  # 0 - 100
        "heat_tolerance_rating": 88,     # 0 - 100
        "faw_disruption_rating": 94,     # 0 - 100 (Non-host break crop for Fall Armyworm)
        "nitrogen_fixation_kg_ha": 65,   # kg N/ha fixed biologically
        "fertilizer_reduction_potential": 65.0,  # % reduction in subsequent fertilizer
        "base_yield_tons_ha": 1.6,
        "market_price_ghs_ton": 5500.0,
        "input_cost_ghs_ha": 2200.0,
        "preferred_soils": ["Sandy Loam", "Loam", "Sandy Clay Loam"],
        "optimal_seasons": ["Minor Rainy Season", "Major Rainy Season"],
        "labor_intensity": "Medium",
        "soil_organic_matter_benefit": "High",
        "agronomic_guidance": (
            "Cowpea is strong in dry weather. Plant it after maize, because it feeds the soil for free "
            "and the armyworms cannot feed on it."
        ),
    },
    "Groundnut": {
        "scientific_name": "Arachis hypogaea",
        "family": "Legume (Nitrogen Fixer & Oilseed)",
        "maturity_days_min": 90,
        "maturity_days_max": 110,
        "optimal_rainfall_mm_min": 500,
        "optimal_rainfall_mm_max": 950,
        "drought_tolerance_rating": 82,
        "heat_tolerance_rating": 85,
        "faw_disruption_rating": 89,
        "nitrogen_fixation_kg_ha": 55,
        "fertilizer_reduction_potential": 55.0,
        "base_yield_tons_ha": 1.8,
        "market_price_ghs_ton": 6200.0,
        "input_cost_ghs_ha": 2800.0,
        "preferred_soils": ["Sandy Loam", "Loam"],
        "optimal_seasons": ["Major Rainy Season", "Minor Rainy Season"],
        "labor_intensity": "High",
        "soil_organic_matter_benefit": "High",
        "agronomic_guidance": (
            "Groundnut covers the ground with leaves, so the soil stays cool and weeds do not grow. "
            "One bag sells for a good price in Ejura and Techiman."
        ),
    },
    "Soyabean": {
        "scientific_name": "Glycine max",
        "family": "Legume (Nitrogen Fixer & Feed)",
        "maturity_days_min": 85,
        "maturity_days_max": 105,
        "optimal_rainfall_mm_min": 550,
        "optimal_rainfall_mm_max": 900,
        "drought_tolerance_rating": 75,
        "heat_tolerance_rating": 80,
        "faw_disruption_rating": 86,
        "nitrogen_fixation_kg_ha": 60,
        "fertilizer_reduction_potential": 50.0,
        "base_yield_tons_ha": 2.0,
        "market_price_ghs_ton": 4800.0,
        "input_cost_ghs_ha": 2600.0,
        "preferred_soils": ["Loam", "Clay Loam", "Sandy Loam"],
        "optimal_seasons": ["Major Rainy Season"],
        "labor_intensity": "Medium",
        "soil_organic_matter_benefit": "Medium",
        "agronomic_guidance": (
            "Soyabean sells well to poultry feed buyers. It feeds the soil and stops the worms from "
            "finding food on your land."
        ),
    },
    "Cassava": {
        "scientific_name": "Manihot esculenta",
        "family": "Root & Tuber (Resilient Soil Breaker)",
        "maturity_days_min": 240,
        "maturity_days_max": 365,
        "optimal_rainfall_mm_min": 600,
        "optimal_rainfall_mm_max": 1200,
        "drought_tolerance_rating": 95,
        "heat_tolerance_rating": 92,
        "faw_disruption_rating": 96,
        "nitrogen_fixation_kg_ha": 0,
        "fertilizer_reduction_potential": 70.0,
        "base_yield_tons_ha": 14.5,
        "market_price_ghs_ton": 950.0,
        "input_cost_ghs_ha": 3100.0,
        "preferred_soils": ["Sandy Loam", "Loam", "Sandy Clay Loam"],
        "optimal_seasons": ["Major Rainy Season"],
        "labor_intensity": "Medium",
        "soil_organic_matter_benefit": "High",
        "agronomic_guidance": (
            "Cassava is the strongest crop in dry weather. It stays alive when the rains stop, "
            "and the armyworms cannot feed on it."
        ),
    },
    "Yam": {
        "scientific_name": "Dioscorea rotundata",
        "family": "Root & Tuber (Premium Cash Crop)",
        "maturity_days_min": 180,
        "maturity_days_max": 240,
        "optimal_rainfall_mm_min": 800,
        "optimal_rainfall_mm_max": 1400,
        "drought_tolerance_rating": 68,
        "heat_tolerance_rating": 72,
        "faw_disruption_rating": 92,
        "nitrogen_fixation_kg_ha": 0,
        "fertilizer_reduction_potential": 30.0,
        "base_yield_tons_ha": 12.0,
        "market_price_ghs_ton": 1800.0,
        "input_cost_ghs_ha": 6500.0,
        "preferred_soils": ["Sandy Loam", "Loam"],
        "optimal_seasons": ["Major Rainy Season"],
        "labor_intensity": "High",
        "soil_organic_matter_benefit": "Medium",
        "agronomic_guidance": (
            "Yam gives the most money in Ejura. It needs strong stakes and big mounds. "
            "Plant it after beans, because the beans would have fed the soil already."
        ),
    },
    "Pigeon Pea": {
        "scientific_name": "Cajanus cajan",
        "family": "Cover Crop & Biological Armor",
        "maturity_days_min": 120,
        "maturity_days_max": 180,
        "optimal_rainfall_mm_min": 400,
        "optimal_rainfall_mm_max": 850,
        "drought_tolerance_rating": 96,
        "heat_tolerance_rating": 95,
        "faw_disruption_rating": 96,
        "nitrogen_fixation_kg_ha": 90,
        "fertilizer_reduction_potential": 85.0,
        "base_yield_tons_ha": 1.4,
        "market_price_ghs_ton": 5200.0,
        "input_cost_ghs_ha": 1800.0,
        "preferred_soils": ["Sandy Loam", "Clay Loam", "Loam", "Sandy Clay Loam"],
        "optimal_seasons": ["Major Rainy Season", "Minor Rainy Season"],
        "labor_intensity": "Low",
        "soil_organic_matter_benefit": "Very High",
        "agronomic_guidance": (
            "Pigeon pea has long roots that go deep for water and break hard soil. It feeds the soil "
            "very well, and weeds and worms find it hard to grow around it."
        ),
    },
    "Rice": {
        "scientific_name": "Oryza sativa",
        "family": "Cereal (Upland/Lowland Grain)",
        "maturity_days_min": 105,
        "maturity_days_max": 130,
        "optimal_rainfall_mm_min": 900,
        "optimal_rainfall_mm_max": 1600,
        "drought_tolerance_rating": 52,
        "heat_tolerance_rating": 70,
        "faw_disruption_rating": 45,
        "nitrogen_fixation_kg_ha": 0,
        "fertilizer_reduction_potential": 15.0,
        "base_yield_tons_ha": 3.2,
        "market_price_ghs_ton": 4200.0,
        "input_cost_ghs_ha": 4800.0,
        "preferred_soils": ["Clay Loam", "Loam"],
        "optimal_seasons": ["Major Rainy Season"],
        "labor_intensity": "High",
        "soil_organic_matter_benefit": "Medium",
        "agronomic_guidance": (
            "Rice sells well. Plant it in low land that holds water, and plant beans on the land "
            "now and then so you spend less money on fertilizer."
        ),
    },
    "Maize": {
        "scientific_name": "Zea mays",
        "family": "Cereal (Baseline Monoculture)",
        "maturity_days_min": 90,
        "maturity_days_max": 115,
        "optimal_rainfall_mm_min": 600,
        "optimal_rainfall_mm_max": 1100,
        "drought_tolerance_rating": 60,
        "heat_tolerance_rating": 68,
        "faw_disruption_rating": 10,  # Highly vulnerable primary host
        "nitrogen_fixation_kg_ha": 0,
        "fertilizer_reduction_potential": 0.0,
        "base_yield_tons_ha": 2.8,
        "market_price_ghs_ton": 3200.0,
        "input_cost_ghs_ha": 4200.0,
        "preferred_soils": ["Sandy Loam", "Loam", "Sandy Clay Loam"],
        "optimal_seasons": ["Major Rainy Season", "Minor Rainy Season"],
        "labor_intensity": "Medium",
        "soil_organic_matter_benefit": "Low",
        "agronomic_guidance": (
            "Maize is the main food crop in Ejura. Do not plant it on the same land every year, "
            "or the worms will come and the soil will get weak."
        ),
    },
}

# Rotation compatibility matrix: how well the next crop succeeds the previous crop
# Scale 0 to 1.0 (1.0 = highly synergistic biological rotation)
ROTATION_AFFINITY_MATRIX: Dict[str, Dict[str, float]] = {
    "Maize": {
        "Cowpea": 0.98,      # Legume breaks FAW & adds N
        "Groundnut": 0.94,   # Legume breaks FAW & adds N
        "Cassava": 0.90,     # Soil rest & root expansion
        "Pigeon Pea": 0.97,  # Maximum biological recovery
        "Soyabean": 0.92,    # Legume rotation
        "Yam": 0.85,         # Tuber rotation
        "Rice": 0.60,        # Cereal-cereal (not recommended)
        "Maize": 0.20,       # Continuous monoculture penalty
    },
    "Cowpea": {
        "Maize": 0.96,       # Maize thrives on residual N
        "Yam": 0.92,
        "Cassava": 0.88,
        "Rice": 0.82,
        "Groundnut": 0.65,
        "Soyabean": 0.60,
        "Pigeon Pea": 0.70,
        "Cowpea": 0.40,
    },
    "Groundnut": {
        "Maize": 0.95,
        "Yam": 0.90,
        "Cassava": 0.85,
        "Rice": 0.80,
        "Cowpea": 0.65,
        "Groundnut": 0.40,
        "Soyabean": 0.60,
        "Pigeon Pea": 0.70,
    },
    "Cassava": {
        "Cowpea": 0.94,
        "Groundnut": 0.90,
        "Maize": 0.88,
        "Soyabean": 0.86,
        "Pigeon Pea": 0.85,
        "Yam": 0.65,
        "Cassava": 0.35,
        "Rice": 0.75,
    },
    "Yam": {
        "Cowpea": 0.95,
        "Groundnut": 0.92,
        "Maize": 0.88,
        "Soyabean": 0.88,
        "Pigeon Pea": 0.90,
        "Rice": 0.70,
        "Yam": 0.30,
        "Cassava": 0.60,
    },
    "Rice": {
        "Cowpea": 0.95,
        "Groundnut": 0.88,
        "Soyabean": 0.85,
        "Pigeon Pea": 0.80,
        "Maize": 0.65,
        "Cassava": 0.70,
        "Yam": 0.70,
        "Rice": 0.30,
    },
}

# Soil texture suitability adjustments (multiplier 0.7 - 1.05)
SOIL_SUITABILITY: Dict[str, Dict[str, float]] = {
    "Sandy Loam": {
        "Cowpea": 1.02,
        "Groundnut": 1.05,
        "Cassava": 1.02,
        "Yam": 1.03,
        "Maize": 1.00,
        "Soyabean": 0.95,
        "Pigeon Pea": 1.02,
        "Rice": 0.85,
    },
    "Loam": {
        "Cowpea": 1.00,
        "Groundnut": 1.00,
        "Cassava": 1.00,
        "Yam": 1.02,
        "Maize": 1.05,
        "Soyabean": 1.05,
        "Pigeon Pea": 1.00,
        "Rice": 0.98,
    },
    "Clay Loam": {
        "Rice": 1.08,
        "Soyabean": 1.02,
        "Maize": 0.98,
        "Pigeon Pea": 1.00,
        "Cowpea": 0.92,
        "Groundnut": 0.88,
        "Cassava": 0.90,
        "Yam": 0.88,
    },
    "Sandy Clay Loam": {
        "Cowpea": 0.98,
        "Groundnut": 0.95,
        "Cassava": 0.98,
        "Yam": 0.96,
        "Maize": 1.00,
        "Soyabean": 1.00,
        "Pigeon Pea": 1.00,
        "Rice": 0.95,
    },
}
