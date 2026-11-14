"""
Phase 4: Crop Rotation Systems and Agronomic Parameters for Space2Soil
Pilot Location: Ejura, Ashanti Region, Ghana

Defines:
1. Baseline Scenario: Continuous Conventional Maize Monoculture
2. Scenario 1 (Regenerative Climate Resilience): Maize + Cassava Relay -> Cowpea
3. Scenario 2 (Commercial Agro-Economic Diversification): Yam + Maize -> Soybean
"""

# Market economics & agronomic benchmarks based on Ghana MoFA & CSIR-CRI field trials
# Currency: Ghanaian Cedis (GHS), 1 USD ~ 15 GHS benchmark
CROP_AGRONOMICS = {
    "Maize_Conventional": {
        "name": "Conventional Maize (Obatanpa)",
        "season": "Major_Season",
        "cycle_days": 105,
        "yield_kg_per_ha": 2400.0,
        "market_price_ghs_per_kg": 4.50,
        "seed_cost_ghs_ha": 350.0,
        "fertilizer_cost_ghs_ha": 1800.0, # NPK 15-15-15 + Urea
        "labor_tillage_cost_ghs_ha": 1200.0,
        "pest_chemical_cost_ghs_ha": 450.0, # Fall armyworm protection
        "nitrogen_balance_kg_n_ha": -75.0, # Net N depleted from soil
        "water_sensitivity_ky": 1.25,      # FAO Ky: highly sensitive to flowering drought
        "calories_per_kg": 3650,
        "protein_g_per_kg": 94
    },
    "Maize_Climate_Smart": {
        "name": "Drought-Tolerant Maize (Omankwa)",
        "season": "Major_Season",
        "cycle_days": 90,
        "yield_kg_per_ha": 2800.0,
        "market_price_ghs_per_kg": 4.80,
        "seed_cost_ghs_ha": 420.0,
        "fertilizer_cost_ghs_ha": 1100.0, # Lower synthetic N needed with legume rotation
        "labor_tillage_cost_ghs_ha": 1100.0,
        "pest_chemical_cost_ghs_ha": 300.0,
        "nitrogen_balance_kg_n_ha": -50.0,
        "water_sensitivity_ky": 0.85,      # Tolerates short dry spells
        "calories_per_kg": 3650,
        "protein_g_per_kg": 94
    },
    "Cowpea": {
        "name": "Early Cowpea (Songotra)",
        "season": "Minor_Season",
        "cycle_days": 65,
        "yield_kg_per_ha": 1400.0,
        "market_price_ghs_per_kg": 9.50,
        "seed_cost_ghs_ha": 280.0,
        "fertilizer_cost_ghs_ha": 200.0,  # Minimal N, small starter P
        "labor_tillage_cost_ghs_ha": 800.0,
        "pest_chemical_cost_ghs_ha": 400.0,
        "nitrogen_balance_kg_n_ha": +55.0, # Biological Nitrogen Fixation (BNF) credit
        "water_sensitivity_ky": 0.70,      # High drought resistance
        "calories_per_kg": 3430,
        "protein_g_per_kg": 235
    },
    "Soybean": {
        "name": "Commercial Soybean (Afayak)",
        "season": "Minor_Season",
        "cycle_days": 95,
        "yield_kg_per_ha": 1800.0,
        "market_price_ghs_per_kg": 7.50,
        "seed_cost_ghs_ha": 380.0,
        "fertilizer_cost_ghs_ha": 300.0,
        "labor_tillage_cost_ghs_ha": 950.0,
        "pest_chemical_cost_ghs_ha": 350.0,
        "nitrogen_balance_kg_n_ha": +45.0, # BNF credit
        "water_sensitivity_ky": 0.85,
        "calories_per_kg": 4460,
        "protein_g_per_kg": 360
    },
    "Cassava": {
        "name": "Improved Cassava (Bankyehemaa)",
        "season": "Intercrop_Relay",
        "cycle_days": 300,
        "yield_kg_per_ha": 15000.0,
        "market_price_ghs_per_kg": 1.10,
        "seed_cost_ghs_ha": 250.0, # Cuttings
        "fertilizer_cost_ghs_ha": 400.0,
        "labor_tillage_cost_ghs_ha": 1400.0, # Harvesting labor
        "pest_chemical_cost_ghs_ha": 150.0,
        "nitrogen_balance_kg_n_ha": -25.0,
        "water_sensitivity_ky": 0.50, # Extreme drought tolerance
        "calories_per_kg": 1600,
        "protein_g_per_kg": 14
    },
    "Yam": {
        "name": "White Yam (Pona)",
        "season": "Major_Season",
        "cycle_days": 210,
        "yield_kg_per_ha": 12000.0,
        "market_price_ghs_per_kg": 3.80,
        "seed_cost_ghs_ha": 3200.0, # High seed sett cost
        "fertilizer_cost_ghs_ha": 1200.0,
        "labor_tillage_cost_ghs_ha": 2800.0, # Mounding & staking
        "pest_chemical_cost_ghs_ha": 500.0,
        "nitrogen_balance_kg_n_ha": -40.0,
        "water_sensitivity_ky": 0.95,
        "calories_per_kg": 1180,
        "protein_g_per_kg": 15
    }
}

ROTATION_SCENARIOS = {
    "Baseline": {
        "id": "SCENARIO_0",
        "name": "Conventional Maize Monoculture (Baseline)",
        "tagline": "Traditional practice: High fertilizer dependency & climate vulnerability",
        "components": ["Maize_Conventional"],
        "description": "Continuous maize planted in the Major Season followed by weedy fallow or late minor maize with no legume rotation.",
        "cropping_intensity": 1.0,
        "soil_cover_months": 4.5
    },
    "Scenario_1": {
        "id": "SCENARIO_1",
        "name": "Regenerative Climate-Resilient Rotation",
        "tagline": "Optimized for drought buffering, soil regeneration, and household food security",
        "components": ["Maize_Climate_Smart", "Cowpea", "Cassava"],
        "description": "Drought-tolerant early maize intercropped with cassava in Major Season, followed by short-duration nitrogen-fixing cowpea in Minor Season.",
        "cropping_intensity": 2.3,
        "soil_cover_months": 10.0
    },
    "Scenario_2": {
        "id": "SCENARIO_2",
        "name": "Commercial Agro-Economic Diversification",
        "tagline": "High-profit market linkage paired with legume nitrogen crediting",
        "components": ["Yam", "Maize_Climate_Smart", "Soybean"],
        "description": "Premium white yam with border maize in Major Season, followed by high-demand commercial soybean in Minor Season.",
        "cropping_intensity": 2.0,
        "soil_cover_months": 9.0
    }
}

