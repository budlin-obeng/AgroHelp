"""
Phase 3: Thermal Regime, GDD & Heat Stress Analysis for Space2Soil
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
log_file = os.path.join(LOG_DIR, "analysis_thermal.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

# Base temperatures for GDD calculation
T_BASE_MAIZE_COWPEA = 10.0   # °C
T_BASE_CASSAVA_YAM = 15.0    # °C
T_CUTOFF_MAX = 35.0          # °C upper developmental threshold

def run_thermal_analysis(base_dir):
    clean_csv = os.path.join(base_dir, "data", "processed", "climate", "nasa_power_ejura_daily_clean.csv")
    out_dir = os.path.join(base_dir, "data", "processed", "analysis")
    os.makedirs(out_dir, exist_ok=True)

    logging.info(f"Loading cleaned daily climate dataset from {clean_csv}")
    df = pd.read_csv(clean_csv)
    df["dt"] = pd.to_datetime(df["date"])
    df["year"] = df["dt"].dt.year
    df["month"] = df["dt"].dt.month
    df["year_month"] = df["dt"].dt.to_period("M").astype(str)

    # 1. Growing Degree Days (GDD) Calculation
    # GDD = max(0, min(Tmax, 35) + min(Tmin, 35) / 2 - Tbase)
    t_mean_eff = (df["temperature_max_c"].clip(upper=T_CUTOFF_MAX) + df["temperature_min_c"]) / 2.0
    df["gdd_base10_maize"] = (t_mean_eff - T_BASE_MAIZE_COWPEA).clip(lower=0.0).round(2)
    df["gdd_base15_cassava_yam"] = (t_mean_eff - T_BASE_CASSAVA_YAM).clip(lower=0.0).round(2)

    # 2. Heat Stress Categories
    # Critical threshold for maize tassel / pollen desiccation is 35°C
    df["heat_stress_mild_33c"] = (df["temperature_max_c"] >= 33.0).astype(int)
    df["heat_stress_critical_35c"] = (df["temperature_max_c"] >= 35.0).astype(int)
    df["heat_stress_severe_38c"] = (df["temperature_max_c"] >= 38.0).astype(int)

    # Save daily thermal metrics
    daily_thermal_path = os.path.join(out_dir, "thermal_gdd_heat_stress_daily.csv")
    df[[
        "date", "temperature_mean_c", "temperature_max_c", "temperature_min_c",
        "diurnal_temp_range_c", "gdd_base10_maize", "gdd_base15_cassava_yam",
        "heat_stress_critical_35c", "heat_stress_severe_38c"
    ]].to_csv(daily_thermal_path, index=False)
    logging.info(f"Saved daily thermal metrics to {daily_thermal_path}")

    # 3. Decadal Annual Thermal Trends (2016 - 2025)
    yearly = df.groupby("year").agg({
        "temperature_mean_c": "mean",
        "temperature_max_c": ["mean", "max"],
        "temperature_min_c": ["mean", "min"],
        "diurnal_temp_range_c": "mean",
        "gdd_base10_maize": "sum",
        "gdd_base15_cassava_yam": "sum",
        "heat_stress_critical_35c": "sum",
        "heat_stress_severe_38c": "sum"
    })
    yearly.columns = [
        "temp_mean_annual_c", "temp_max_mean_c", "temp_max_absolute_c",
        "temp_min_mean_c", "temp_min_absolute_c", "diurnal_temp_range_mean_c",
        "annual_cumulative_gdd_maize", "annual_cumulative_gdd_cassava_yam",
        "heat_stress_days_ge_35c", "severe_heat_stress_days_ge_38c"
    ]
    yearly = yearly.round(2).reset_index()

    # Linear trend analysis (slope per decade)
    years = yearly["year"].values
    t_mean = yearly["temp_mean_annual_c"].values
    slope_tmean, _ = np.polyfit(years, t_mean, 1)

    t_min = yearly["temp_min_mean_c"].values
    slope_tmin, _ = np.polyfit(years, t_min, 1)

    yearly["decadal_warming_rate_tmean_c_per_decade"] = round(slope_tmean * 10, 3)
    yearly["decadal_nighttime_warming_rate_tmin_c_per_decade"] = round(slope_tmin * 10, 3)

    trends_path = os.path.join(out_dir, "annual_temperature_trends.csv")
    yearly.to_csv(trends_path, index=False)
    logging.info(f"Saved annual thermal trends to {trends_path}")

    return daily_thermal_path, trends_path

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    run_thermal_analysis(base_dir)

