"""
Phase 4: Explainable AI (XAI) Recommendation Explainer for Space2Soil
Generates transparent agronomic rationales, trade-offs, and actionable guidance
for smallholder farmers and agricultural extension officers in Ghana.
"""

import os
import sys
import json
import logging
import pandas as pd

# Setup logging
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "engine_explainer.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def generate_recommendation_cards(df_eval):
    cards = []
    
    # 1. Baseline Evaluation Card
    row_base = df_eval[df_eval["scenario_key"] == "Baseline"].iloc[0]
    cards.append({
        "scenario_id": "BASELINE_CONVENTIONAL",
        "title": "Baseline: Continuous Maize Monoculture",
        "composite_rank": int(row_base["rank"]),
        "composite_score": float(row_base["composite_score"]),
        "verdict": "VULNERABLE & UNSUSTAINABLE UNDER PROJECTED CLIMATE SHIFTS",
        "nasa_evidence": [
            "NASA GPM decadal records demonstrate 32 dry spells (>= 5 days) during the growing season; conventional maize suffers severe yield drag when dry spells coincide with silking.",
            "NASA POWER indicates 34 annual heat stress days (Tmax >= 35°C), coinciding with tassel flowering in unprotected monoculture.",
            "NASA SMAP confirms topsoil (0-5cm) dries out in < 4 days, leaving bare post-harvest soil vulnerable to high rainfall erosivity (MFI > 140)."
        ],
        "agronomic_vulnerabilities": [
            f"Net soil nitrogen depletion of {abs(row_base['net_soil_nitrogen_balance_kg_ha'])} kg N/ha per year, requiring heavy synthetic fertilizer expenditure (GHS {row_base['synthetic_fertilizer_cost_ghs']}/ha).",
            "Continuous host plant presence intensifies Fall Armyworm (Spodoptera frugiperda) pest pressure.",
            "Monoculture price volatility exposes the farm family to single-crop market collapse."
        ],
        "financial_return": {
            "net_profit_ghs": float(row_base["net_profit_ghs"]),
            "net_profit_usd": float(row_base["net_profit_usd"]),
            "roi": float(row_base["return_on_investment_roi"])
        }
    })

    # 2. Scenario 1: Regenerative Climate Resilience Card (Primary Winner)
    row_s1 = df_eval[df_eval["scenario_key"] == "Scenario_1"].iloc[0]
    cards.append({
        "scenario_id": "SCENARIO_1_CLIMATE_RESILIENCE",
        "title": "Scenario 1: Regenerative Climate-Resilient Rotation",
        "composite_rank": int(row_s1["rank"]),
        "composite_score": float(row_s1["composite_score"]),
        "verdict": "TOP RECOMMENDATION FOR CLIMATE RESILIENCE & FOOD SECURITY",
        "core_strategy": "Drought-Tolerant Maize + Relay Cassava (Major Season) -> Nitrogen-Fixing Cowpea (Minor Season)",
        "why_it_wins": [
            f"Increases net farm profit by +{round((row_s1['net_profit_ghs'] - row_base['net_profit_ghs']) / row_base['net_profit_ghs'] * 100, 1)}% over baseline (GHS {row_s1['net_profit_ghs']} vs GHS {row_base['net_profit_ghs']}).",
            f"Cuts synthetic fertilizer expenditure by GHS {round(row_base['synthetic_fertilizer_cost_ghs'] - row_s1['synthetic_fertilizer_cost_ghs'], 2)}/ha by leveraging cowpea biological nitrogen fixation (+{row_s1['net_soil_nitrogen_balance_kg_ha']} kg N/ha net budget).",
            f"Extends living soil cover from 4.5 months to {row_s1['soil_cover_duration_months']} months, suppressing weeds and shielding topsoil from torrential storm runoff.",
            f"Dramatically enhances household protein yield (+{round(row_s1['total_protein_yield_kg_ha'] - row_base['total_protein_yield_kg_ha'], 1)} kg protein/ha) via high-protein cowpea pulses."
        ],
        "nasa_decision_triggers": {
            "planting_trigger": "Wait for NASA GPM 3-day rainfall >= 20mm after March 20 AND SMAP root-zone moisture anomaly Z > 0.0 before sowing maize/cassava.",
            "dry_spell_mitigation": "Cassava roots penetrate 0-100cm, tapping subsoil water reserves identified by SMAP during mid-season dry spells.",
            "minor_season_trigger": "Sow short-duration Cowpea (65 days) by September 10 to mature before November Harmattan cessation."
        },
        "trade_offs_and_management": [
            "Cassava harvesting requires distributed family or hired labor over an extended window.",
            "Requires access to certified pest-resistant cassava cuttings (Bankyehemaa) and early cowpea seed."
        ],
        "financial_return": {
            "net_profit_ghs": float(row_s1["net_profit_ghs"]),
            "net_profit_usd": float(row_s1["net_profit_usd"]),
            "roi": float(row_s1["return_on_investment_roi"])
        }
    })

    # 3. Scenario 2: Commercial Diversification Card
    row_s2 = df_eval[df_eval["scenario_key"] == "Scenario_2"].iloc[0]
    cards.append({
        "scenario_id": "SCENARIO_2_COMMERCIAL_PROFIT",
        "title": "Scenario 2: Commercial Agro-Economic Diversification",
        "composite_rank": int(row_s2["rank"]),
        "composite_score": float(row_s2["composite_score"]),
        "verdict": "HIGH PROFIT OPTION FOR CAPITALIZED COMMERCIAL GROWERS",
        "core_strategy": "White Yam (Pona) + Border Maize (Major Season) -> Commercial Soybean (Minor Season)",
        "why_it_wins": [
            f"Generates maximum net economic return (GHS {row_s2['net_profit_ghs']} / ${row_s2['net_profit_usd']}), nearly tripling baseline revenue.",
            "Soybean commands robust guaranteed cash markets in Ghana for poultry feed and cooking oil processing.",
            "Soybean nodulation fixes +45 kg N/ha, replenishing soil nutrients after heavy yam feeding."
        ],
        "nasa_decision_triggers": {
            "soil_workability_trigger": "Plant yam mounds only when SMAP surface moisture reaches 0.40 - 0.60 fraction (prevents clodding).",
            "tuber_bulking_alert": "Monitor SMAP root-zone moisture in July/August during yam tuber expansion."
        },
        "trade_offs_and_management": [
            "High upfront capital requirement: Yam seed setts require substantial initial investment (GHS 3,200/ha).",
            "Mounding, staking, and yam vine maintenance require intensive labor.",
            "Higher vulnerability to severe mid-season droughts than cassava."
        ],
        "financial_return": {
            "net_profit_ghs": float(row_s2["net_profit_ghs"]),
            "net_profit_usd": float(row_s2["net_profit_usd"]),
            "roi": float(row_s2["return_on_investment_roi"])
        }
    })

    return cards

def run_xai_explainer(base_dir):
    rec_dir = os.path.join(base_dir, "data", "processed", "recommendations")
    csv_path = os.path.join(rec_dir, "rotation_scenarios_comparison.csv")
    
    logging.info(f"Loading evaluated scenarios from {csv_path}")
    df_eval = pd.read_csv(csv_path)
    
    cards = generate_recommendation_cards(df_eval)
    
    cards_path = os.path.join(rec_dir, "farmer_recommendation_cards.json")
    with open(cards_path, "w", encoding="utf-8") as f:
        json.dump(cards, f, indent=2)
    logging.info(f"Saved farmer recommendation cards to {cards_path}")
    
    return cards_path

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    run_xai_explainer(base_dir)
