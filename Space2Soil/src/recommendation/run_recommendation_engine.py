"""
Phase 4: Master Runner for Space2Soil Recommendation Engine
Executes multi-criteria evaluation and explainable recommendation card generation.
"""

import os
import sys
import json
import logging
from datetime import datetime

from evaluation_engine import run_evaluation_engine
from xai_explainer import run_xai_explainer

# Setup logging
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "engine_master.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    meta_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(meta_dir, exist_ok=True)

    logging.info("Starting Phase 4 Recommendation Engine master pipeline...")
    
    # 1. Run Evaluation Engine
    csv_path, json_path, df_eval = run_evaluation_engine(base_dir)
    
    # 2. Run XAI Explainer
    cards_path = run_xai_explainer(base_dir)

    # 3. Save Master Metadata
    metadata = {
        "engine_name": "Space2Soil Crop Rotation Multi-Criteria Decision Engine",
        "pilot_target": "Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)",
        "evaluation_criteria_weights": {
            "climate_and_drought_resilience": 0.30,
            "soil_health_and_nitrogen_budget": 0.25,
            "economic_net_income_and_roi": 0.25,
            "household_nutritional_diversity": 0.20
        },
        "scenarios_evaluated": [
            "Baseline: Conventional Maize Monoculture",
            "Scenario 1: Regenerative Climate Resilience (Maize + Cassava Relay -> Cowpea)",
            "Scenario 2: Commercial Agro-Economic Diversification (Yam + Maize -> Soybean)"
        ],
        "winning_recommendation": {
            "resilience_food_security": "Scenario 1 (Regenerative Climate Resilience)",
            "commercial_capitalized": "Scenario 2 (Commercial Diversification)"
        },
        "output_files": [
            "data/processed/recommendations/rotation_scenarios_comparison.csv",
            "data/processed/recommendations/scenario_detailed_scores.json",
            "data/processed/recommendations/farmer_recommendation_cards.json"
        ],
        "execution_timestamp": datetime.utcnow().isoformat() + "Z"
    }

    meta_path = os.path.join(meta_dir, "recommendation_engine_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logging.info(f"Saved recommendation engine metadata to {meta_path}")
    logging.info("Phase 4 Recommendation Engine execution completed successfully.")

if __name__ == "__main__":
    main()
