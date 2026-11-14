"""
Phase 3: Multi-Criteria Crop Suitability Scoring Model for Space2Soil
Evaluates biophysical and climatological suitability for Ghana Transition Zone crops:
- Maize (Zea mays)
- Cassava (Manihot esculenta)
- Yam (Dioscorea rotundata)
- Cowpea (Vigna unguiculata)
- Soybean (Glycine max)
"""

import os
import sys
import json
import logging
import pandas as pd
import numpy as np

# Setup logging
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "analysis_crop_suitability.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

# Crop physiological requirements (FAO Ecocrop & Ghana CSIR-CRI agronomic profiles)
CROP_PROFILES = {
    "Maize": {
        "cycle_days": 105,
        "opt_rainfall_min": 500, "opt_rainfall_max": 800,
        "abs_rainfall_min": 350, "abs_rainfall_max": 1200,
        "opt_temp_min": 22.0, "opt_temp_max": 30.0,
        "heat_stress_threshold": 35.0,
        "drought_sensitivity": "High", # Sensitive during flowering
        "preferred_season": "Major_Season"
    },
    "Cassava": {
        "cycle_days": 300,
        "opt_rainfall_min": 800, "opt_rainfall_max": 1400,
        "abs_rainfall_min": 500, "abs_rainfall_max": 2000,
        "opt_temp_min": 24.0, "opt_temp_max": 32.0,
        "heat_stress_threshold": 38.0,
        "drought_sensitivity": "Low", # Excellent root buffering
        "preferred_season": "Full_Year"
    },
    "Yam": {
        "cycle_days": 210,
        "opt_rainfall_min": 1000, "opt_rainfall_max": 1400,
        "abs_rainfall_min": 750, "abs_rainfall_max": 1800,
        "opt_temp_min": 25.0, "opt_temp_max": 30.0,
        "heat_stress_threshold": 34.0,
        "drought_sensitivity": "Medium-High", # Vulnerable during bulking
        "preferred_season": "Major_Season"
    },
    "Cowpea": {
        "cycle_days": 70,
        "opt_rainfall_min": 300, "opt_rainfall_max": 500,
        "abs_rainfall_min": 200, "abs_rainfall_max": 750,
        "opt_temp_min": 24.0, "opt_temp_max": 32.0,
        "heat_stress_threshold": 36.0,
        "drought_sensitivity": "Low", # Short cycle, drought hardy
        "preferred_season": "Minor_Season"
    },
    "Soybean": {
        "cycle_days": 95,
        "opt_rainfall_min": 450, "opt_rainfall_max": 700,
        "abs_rainfall_min": 350, "abs_rainfall_max": 1000,
        "opt_temp_min": 22.0, "opt_temp_max": 30.0,
        "heat_stress_threshold": 35.0,
        "drought_sensitivity": "Medium",
        "preferred_season": "Major_or_Minor"
    }
}

def score_rainfall(rainfall_val, prof):
    if rainfall_val >= prof["opt_rainfall_min"] and rainfall_val <= prof["opt_rainfall_max"]:
        return 100.0
    elif rainfall_val < prof["abs_rainfall_min"] or rainfall_val > prof["abs_rainfall_max"]:
        return 35.0
    elif rainfall_val < prof["opt_rainfall_min"]:
        # Linear scale between abs_min and opt_min
        frac = (rainfall_val - prof["abs_rainfall_min"]) / (prof["opt_rainfall_min"] - prof["abs_rainfall_min"])
        return 40.0 + (frac * 60.0)
    else:
        # Linear scale between opt_max and abs_max (excess waterlogging penalty)
        frac = (prof["abs_rainfall_max"] - rainfall_val) / (prof["abs_rainfall_max"] - prof["opt_rainfall_max"])
        return 40.0 + (frac * 60.0)

def score_temperature(temp_mean, heat_days, prof):
    score = 100.0
    # Penalty for mean temperature outside optimum
    if temp_mean < prof["opt_temp_min"]:
        score -= min(40, (prof["opt_temp_min"] - temp_mean) * 15)
    elif temp_mean > prof["opt_temp_max"]:
        score -= min(40, (temp_mean - prof["opt_temp_max"]) * 15)
        
    # Penalty for extreme heat stress days (Tmax >= 35°C)
    if heat_days > 0:
        if prof["drought_sensitivity"] == "High":
            score -= min(35, heat_days * 3.0)
        elif prof["drought_sensitivity"] == "Medium":
            score -= min(25, heat_days * 2.0)
        else:
            score -= min(15, heat_days * 1.0)
            
    return max(20.0, score)

def score_soil_moisture(awc_fraction, drought_days, prof):
    score = 100.0
    # Ideal AWC fraction: 0.50 - 0.85
    if awc_fraction < 0.50:
        deficit = 0.50 - awc_fraction
        if prof["drought_sensitivity"] == "High":
            score -= deficit * 120
        elif prof["drought_sensitivity"] == "Medium":
            score -= deficit * 80
        else:
            score -= deficit * 40
            
    # Penalty for consecutive drought days
    score -= min(30, drought_days * 1.5)
    return max(20.0, score)

def run_crop_suitability_model(base_dir):
    analysis_dir = os.path.join(base_dir, "data", "processed", "analysis")
    meta_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(analysis_dir, exist_ok=True)

    # Load environmental inputs
    seasons_df = pd.read_csv(os.path.join(analysis_dir, "rainfall_seasonality_metrics.csv"))
    thermal_df = pd.read_csv(os.path.join(analysis_dir, "annual_temperature_trends.csv"))
    soil_df = pd.read_csv(os.path.join(analysis_dir, "annual_drought_severity.csv"))

    merged = seasons_df.merge(thermal_df, on="year").merge(soil_df, on="year")

    results = []
    for idx, row in merged.iterrows():
        y = int(row["year"])
        ann_rain = row["total_annual_rainfall_mm"]
        temp_mean = row["temp_mean_annual_c"]
        heat_days = row["heat_stress_days_ge_35c"]
        awc = row["mean_available_water_fraction"]
        drought_days = row["total_water_stress_days"]

        for crop_name, prof in CROP_PROFILES.items():
            # For short season crops (Cowpea, Soybean, Maize), scale seasonal rainfall
            if prof["preferred_season"] == "Minor_Season":
                rain_available = ann_rain * 0.40  # Minor season receives ~35-42% of annual rain
            elif prof["preferred_season"] == "Major_Season":
                rain_available = ann_rain * 0.55  # Major season receives ~50-60% of annual rain
            else:
                rain_available = ann_rain

            s_rain = score_rainfall(rain_available, prof)
            s_temp = score_temperature(temp_mean, heat_days, prof)
            s_soil = score_soil_moisture(awc, drought_days / 12.0, prof) # Monthly normalized

            # Composite weighted score (Rain 40%, Soil Moisture 35%, Temperature 25%)
            composite_score = round(0.40 * s_rain + 0.35 * s_soil + 0.25 * s_temp, 1)

            # Assign Suitability Class (FAO)
            if composite_score >= 80.0:
                s_class = "S1_Highly_Suitable"
            elif composite_score >= 65.0:
                s_class = "S2_Moderately_Suitable"
            elif composite_score >= 50.0:
                s_class = "S3_Marginally_Suitable"
            else:
                s_class = "N_Currently_Not_Suitable"

            results.append({
                "year": y,
                "crop": crop_name,
                "composite_suitability_score": composite_score,
                "suitability_class": s_class,
                "rainfall_subscore": round(s_rain, 1),
                "soil_moisture_subscore": round(s_soil, 1),
                "temperature_subscore": round(s_temp, 1),
                "limiting_factor": "Rainfall" if s_rain <= min(s_soil, s_temp) else ("Soil_Moisture" if s_soil <= s_temp else "Temperature")
            })

    df_scores = pd.DataFrame(results)
    scores_csv = os.path.join(analysis_dir, "crop_suitability_decadal_scores.csv")
    df_scores.to_csv(scores_csv, index=False)
    logging.info(f"Saved decadal crop suitability scores to {scores_csv}")

    # Decadal Summary Matrix by Crop
    matrix = df_scores.groupby("crop").agg({
        "composite_suitability_score": ["mean", "min", "max", "std"],
        "rainfall_subscore": "mean",
        "soil_moisture_subscore": "mean",
        "temperature_subscore": "mean"
    }).round(1)
    matrix.columns = ["mean_score", "min_score", "max_score", "score_std", "mean_rainfall_score", "mean_soil_score", "mean_temp_score"]
    matrix = matrix.reset_index()

    # Determine Overall Suitability Tier
    def assign_tier(m):
        if m >= 80.0: return "S1 (Highly Suitable)"
        elif m >= 65.0: return "S2 (Moderately Suitable)"
        elif m >= 50.0: return "S3 (Marginally Suitable)"
        else: return "N (Not Suitable)"

    matrix["overall_suitability_tier"] = matrix["mean_score"].apply(assign_tier)
    matrix_csv = os.path.join(analysis_dir, "crop_suitability_matrix.csv")
    matrix.to_csv(matrix_csv, index=False)
    logging.info(f"Saved crop suitability matrix to {matrix_csv}")

    # Metadata & Scientific Summary
    summary = {
        "analysis_phase": "Phase 3: Scientific Analysis & Agricultural Indicators",
        "location": "Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)",
        "evaluated_crops": list(CROP_PROFILES.keys()),
        "output_files": [
            "data/processed/analysis/rainfall_seasonality_metrics.csv",
            "data/processed/analysis/dry_spell_events.csv",
            "data/processed/analysis/rainfall_erosivity_index.csv",
            "data/processed/analysis/thermal_gdd_heat_stress_daily.csv",
            "data/processed/analysis/annual_temperature_trends.csv",
            "data/processed/analysis/soil_water_balance_analysis.csv",
            "data/processed/analysis/annual_drought_severity.csv",
            "data/processed/analysis/vegetation_phenology_envelope.csv",
            "data/processed/analysis/annual_canopy_performance.csv",
            "data/processed/analysis/crop_suitability_decadal_scores.csv",
            "data/processed/analysis/crop_suitability_matrix.csv"
        ],
        "crop_rankings": matrix[["crop", "mean_score", "overall_suitability_tier"]].to_dict(orient="records")
    }

    sum_path = os.path.join(meta_dir, "scientific_analysis_summary.json")
    with open(sum_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    logging.info(f"Saved scientific analysis summary to {sum_path}")

    return scores_csv, matrix_csv, sum_path

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    run_crop_suitability_model(base_dir)

