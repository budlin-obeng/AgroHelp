"""
Phase 3: Soil Moisture Depletion & Agricultural Drought Analysis for Space2Soil
Pilot Location: Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)
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
log_file = os.path.join(LOG_DIR, "analysis_soil_moisture.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

# Soil hydraulic properties for Ejura Ochrosols (sandy loam / loam)
# Field capacity (theta_fc): ~0.28 m^3/m^3
# Permanent wilting point (theta_pwp): ~0.14 m^3/m^3
# Critical stress threshold (50% Readily Available Water): ~0.21 m^3/m^3
THETA_FC = 0.28
THETA_PWP = 0.14
THETA_CRIT = 0.21

def run_soil_moisture_analysis(base_dir):
    clean_csv = os.path.join(base_dir, "data", "processed", "soil_moisture", "smap_ejura_daily_clean.csv")
    out_dir = os.path.join(base_dir, "data", "processed", "analysis")
    os.makedirs(out_dir, exist_ok=True)

    logging.info(f"Loading cleaned daily soil moisture dataset from {clean_csv}")
    df = pd.read_csv(clean_csv)
    df["dt"] = pd.to_datetime(df["date"])
    df["year"] = df["dt"].dt.year
    df["month"] = df["dt"].dt.month

    # 1. Available Water Content (AWC) Fraction & Crop Water Stress
    # Readily Available Water (RAW) fraction = (theta - theta_pwp) / (theta_fc - theta_pwp)
    theta_rz = df["rootzone_volumetric_moisture_m3_m3"]
    df["rootzone_available_water_fraction"] = ((theta_rz - THETA_PWP) / (THETA_FC - THETA_PWP)).clip(lower=0.0, upper=1.0).round(3)
    
    # Stress: AWC < 0.50 (transpiration reduction begins)
    df["is_rootzone_water_stressed"] = (df["rootzone_available_water_fraction"] < 0.50).astype(int)
    # Severe deficit: AWC < 0.20
    df["is_severe_wilting_risk"] = (df["rootzone_available_water_fraction"] < 0.20).astype(int)

    # 2. Surface vs Root-Zone Moisture Gradient (Drying Lag)
    # Delta = Surface - Rootzone
    # Negative delta indicates rapid surface crusting/drying while rootzone retains moisture
    df["soil_profile_vertical_gradient"] = (df["surface_volumetric_moisture_m3_m3"] - df["rootzone_volumetric_moisture_m3_m3"]).round(4)

    # 3. Rate of Profile Moisture Depletion (7-day rolling change)
    df["rootzone_7day_depletion_rate_m3_m3"] = (df["rootzone_volumetric_moisture_m3_m3"] - df["rootzone_volumetric_moisture_m3_m3"].shift(7)).round(4)

    water_balance_path = os.path.join(out_dir, "soil_water_balance_analysis.csv")
    df[[
        "date", "surface_volumetric_moisture_m3_m3", "rootzone_volumetric_moisture_m3_m3",
        "rootzone_available_water_fraction", "is_rootzone_water_stressed",
        "is_severe_wilting_risk", "soil_profile_vertical_gradient",
        "rootzone_7day_depletion_rate_m3_m3", "rootzone_moisture_anomaly_zscore"
    ]].to_csv(water_balance_path, index=False)
    logging.info(f"Saved daily soil water balance analysis to {water_balance_path}")

    # 4. Decadal Annual Drought & Water Stress Profile
    yearly_drought = df.groupby("year").agg({
        "rootzone_volumetric_moisture_m3_m3": "mean",
        "surface_volumetric_moisture_m3_m3": "mean",
        "rootzone_available_water_fraction": "mean",
        "is_rootzone_water_stressed": "sum",
        "is_severe_wilting_risk": "sum",
        "is_agricultural_drought": "sum"
    }).round(3).reset_index()

    yearly_drought.columns = [
        "year", "mean_rootzone_moisture_m3_m3", "mean_surface_moisture_m3_m3",
        "mean_available_water_fraction", "total_water_stress_days",
        "severe_wilting_risk_days", "anomaly_drought_days_z_le_neg1"
    ]

    drought_profile_path = os.path.join(out_dir, "annual_drought_severity.csv")
    yearly_drought.to_csv(drought_profile_path, index=False)
    logging.info(f"Saved annual drought severity metrics to {drought_profile_path}")

    return water_balance_path, drought_profile_path

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    run_soil_moisture_analysis(base_dir)

