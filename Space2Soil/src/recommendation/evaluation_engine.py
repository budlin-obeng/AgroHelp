"""
Phase 4: Multi-Criteria Decision Engine for Crop Rotation Evaluation
Evaluates scenarios across:
1. Climate & Drought Resilience (30%)
2. Soil Health & Nitrogen Balance (25%)
3. Economic Net Income & Profitability (25%)
4. Household Nutritional Diversity (20%)
"""

import os
import sys
import json
import logging
import pandas as pd
import numpy as np

from rotation_models import CROP_AGRONOMICS, ROTATION_SCENARIOS

# Setup logging
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "engine_evaluation.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

WEIGHTS = {
    "resilience": 0.30,
    "soil_health": 0.25,
    "economics": 0.25,
    "nutrition": 0.20
}

def evaluate_scenario(scenario_key, scenario_dict):
    components = scenario_dict["components"]
    
    # 1. Economic Balance
    gross_revenue_ghs = 0.0
    total_cost_ghs = 0.0
    fert_cost_ghs = 0.0
    
    # 2. Soil & Nitrogen Budget
    net_nitrogen_kg_ha = 0.0
    
    # 3. Nutrition Budget
    total_calories_mcal = 0.0
    total_protein_kg = 0.0
    
    # 4. Resilience
    weighted_ky = 0.0
    
    # Fractions for intercropping/relay allocation (totaling 1 ha farm equivalent)
    if scenario_key == "Baseline":
        allocations = [1.0]
    elif scenario_key == "Scenario_1":
        # 0.6 ha Maize + 0.4 ha Cassava in Major Season; full 1.0 ha Cowpea in Minor Season
        allocations = [0.6, 1.0, 0.4]
    else: # Scenario_2
        # 0.5 ha Yam + 0.5 ha Maize in Major Season; 1.0 ha Soybean in Minor Season
        allocations = [0.5, 0.5, 1.0]

    for comp_key, frac in zip(components, allocations):
        crop = CROP_AGRONOMICS[comp_key]
        
        # Economics
        crop_rev = crop["yield_kg_per_ha"] * crop["market_price_ghs_per_kg"] * frac
        crop_cost = (
            crop["seed_cost_ghs_ha"] +
            crop["fertilizer_cost_ghs_ha"] +
            crop["labor_tillage_cost_ghs_ha"] +
            crop["pest_chemical_cost_ghs_ha"]
        ) * frac
        
        gross_revenue_ghs += crop_rev
        total_cost_ghs += crop_cost
        fert_cost_ghs += crop["fertilizer_cost_ghs_ha"] * frac
        
        # Soil Nitrogen
        net_nitrogen_kg_ha += crop["nitrogen_balance_kg_n_ha"] * frac
        
        # Nutrition
        total_calories_mcal += (crop["yield_kg_per_ha"] * crop["calories_per_kg"] * frac) / 1000.0
        total_protein_kg += (crop["yield_kg_per_ha"] * (crop["protein_g_per_kg"] / 1000.0) * frac)
        
        # Resilience Ky
        weighted_ky += crop["water_sensitivity_ky"] * (frac / sum(allocations))

    net_profit_ghs = gross_revenue_ghs - total_cost_ghs
    usd_conversion = 15.0 # GHS per USD
    net_profit_usd = round(net_profit_ghs / usd_conversion, 2)
    roi_ratio = round(net_profit_ghs / total_cost_ghs, 2) if total_cost_ghs > 0 else 0.0

    # Dimension Sub-Scores (Normalized 0 - 100)
    
    # A. Climate & Drought Resilience Score (0 - 100)
    # Lower Ky = higher resilience. Ky ~ 0.5 is 100; Ky ~ 1.3 is 30.
    resilience_score = round(float(np.clip(130.0 - (weighted_ky * 70.0), 20.0, 100.0)), 1)
    # Bonus for soil cover buffering against erosion
    resilience_score = round(min(100.0, resilience_score + (scenario_dict["soil_cover_months"] * 1.5)), 1)

    # B. Soil Health & Nitrogen Score (0 - 100)
    # Neutral/Negative N depleted -> score 35-50. Positive N surplus (+30 kg N) -> score 90-100.
    soil_score = round(float(np.clip(55.0 + (net_nitrogen_kg_ha * 0.9) + (scenario_dict["soil_cover_months"] * 2.5), 20.0, 100.0)), 1)

    # C. Economics Score (0 - 100)
    # Net profit benchmark: Baseline ~ 6,950 GHS (Score 50); Scenario 1 ~ 18,000 GHS (Score 85); Scenario 2 ~ 26,000 GHS (Score 96)
    economics_score = round(float(np.clip(30.0 + (net_profit_ghs / 320.0), 20.0, 100.0)), 1)

    # D. Nutrition & Food Security Score (0 - 100)
    # Balanced protein + calorie density
    nutrition_score = round(float(np.clip(25.0 + (total_protein_kg * 0.22) + (total_calories_mcal * 0.002), 20.0, 100.0)), 1)

    # Composite Score
    composite = round(
        (WEIGHTS["resilience"] * resilience_score) +
        (WEIGHTS["soil_health"] * soil_score) +
        (WEIGHTS["economics"] * economics_score) +
        (WEIGHTS["nutrition"] * nutrition_score), 1
    )

    return {
        "scenario_key": scenario_key,
        "scenario_name": scenario_dict["name"],
        "tagline": scenario_dict["tagline"],
        "crops_sequence": " -> ".join([CROP_AGRONOMICS[c]["name"] for c in components]),
        "composite_score": composite,
        "climate_resilience_subscore": resilience_score,
        "soil_health_subscore": soil_score,
        "economic_profit_subscore": economics_score,
        "nutritional_diversity_subscore": nutrition_score,
        "gross_revenue_ghs": round(gross_revenue_ghs, 2),
        "total_production_cost_ghs": round(total_cost_ghs, 2),
        "net_profit_ghs": round(net_profit_ghs, 2),
        "net_profit_usd": net_profit_usd,
        "return_on_investment_roi": roi_ratio,
        "synthetic_fertilizer_cost_ghs": round(fert_cost_ghs, 2),
        "net_soil_nitrogen_balance_kg_ha": round(net_nitrogen_kg_ha, 1),
        "soil_cover_duration_months": scenario_dict["soil_cover_months"],
        "total_protein_yield_kg_ha": round(total_protein_kg, 1),
        "total_calories_mcal_ha": round(total_calories_mcal, 1)
    }

def run_evaluation_engine(base_dir):
    out_dir = os.path.join(base_dir, "data", "processed", "recommendations")
    meta_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(meta_dir, exist_ok=True)

    logging.info("Executing Phase 4 Multi-Criteria Recommendation Engine...")
    scenario_evaluations = []
    for s_key, s_data in ROTATION_SCENARIOS.items():
        res = evaluate_scenario(s_key, s_data)
        scenario_evaluations.append(res)
        logging.info(f"Evaluated {s_key}: Composite Score = {res['composite_score']} (Profit: GHS {res['net_profit_ghs']})")

    df_eval = pd.DataFrame(scenario_evaluations).sort_values("composite_score", ascending=False).reset_index(drop=True)
    df_eval["rank"] = df_eval.index + 1

    csv_path = os.path.join(out_dir, "rotation_scenarios_comparison.csv")
    df_eval.to_csv(csv_path, index=False)
    logging.info(f"Saved scenario comparison table to {csv_path}")

    json_path = os.path.join(out_dir, "scenario_detailed_scores.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(scenario_evaluations, f, indent=2)
    logging.info(f"Saved detailed scenario scores to {json_path}")

    return csv_path, json_path, df_eval

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    run_evaluation_engine(base_dir)

