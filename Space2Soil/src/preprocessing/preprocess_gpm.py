"""
NASA GPM Precipitation Preprocessing for Space2Soil
Aggregates monthly rainfall, computes rainfall variability, and identifies extreme rainfall periods.
"""

import os
import sys
import json
import logging
from datetime import datetime
import pandas as pd
import numpy as np

# Setup logging
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "preprocessing_gpm.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def preprocess_gpm(base_dir):
    raw_csv = os.path.join(base_dir, "data", "raw", "gpm", "gpm_imerg_ejura_daily_raw.csv")
    out_dir = os.path.join(base_dir, "data", "processed", "rainfall")
    meta_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(meta_dir, exist_ok=True)

    logging.info(f"Loading raw GPM precipitation from {raw_csv}")
    df_raw = pd.read_csv(raw_csv, dtype={"DATE": str})

    # Standardize daily dataset
    df = pd.DataFrame({
        "date": pd.to_datetime(df_raw["DATE"], format="%Y%m%d").dt.strftime("%Y-%m-%d"),
        "precipitation_mm": df_raw["GPM_IMERG_PRECIPITATION_MM"].round(2)
    })

    # Agronomic precipitation flags
    df["is_rain_day"] = (df["precipitation_mm"] >= 1.0).astype(int)
    df["is_heavy_rain"] = (df["precipitation_mm"] >= 25.0).astype(int)
    df["is_extreme_rain"] = (df["precipitation_mm"] >= 50.0).astype(int)

    # 7-day rolling cumulative rainfall (soil saturation and flash flood risk)
    df["rainfall_7day_cumulative_mm"] = df["precipitation_mm"].rolling(window=7, min_periods=1).sum().round(2)
    # 30-day rolling rainfall (agricultural moisture balance)
    df["rainfall_30day_cumulative_mm"] = df["precipitation_mm"].rolling(window=30, min_periods=1).sum().round(2)

    clean_daily_path = os.path.join(out_dir, "gpm_ejura_daily_clean.csv")
    df.to_csv(clean_daily_path, index=False)
    logging.info(f"Saved clean daily GPM dataset to {clean_daily_path} ({len(df)} records)")

    # Monthly Aggregations
    df["year_month"] = pd.to_datetime(df["date"]).dt.to_period("M").astype(str)
    monthly_grouped = df.groupby("year_month")

    monthly_records = []
    for ym, grp in monthly_grouped:
        total_precip = round(float(grp["precipitation_mm"].sum()), 2)
        mean_precip = round(float(grp["precipitation_mm"].mean()), 2)
        std_precip = round(float(grp["precipitation_mm"].std()), 2)
        cv = round(std_precip / mean_precip, 2) if mean_precip > 0 else 0.0
        max_1day = round(float(grp["precipitation_mm"].max()), 2)
        rain_days = int(grp["is_rain_day"].sum())
        heavy_days = int(grp["is_heavy_rain"].sum())
        extreme_days = int(grp["is_extreme_rain"].sum())
        max_7day = round(float(grp["rainfall_7day_cumulative_mm"].max()), 2)

        monthly_records.append({
            "year_month": ym,
            "year": int(ym[:4]),
            "month": int(ym[5:7]),
            "total_precipitation_mm": total_precip,
            "mean_daily_precipitation_mm": mean_precip,
            "precipitation_std_mm": std_precip,
            "precipitation_coefficient_of_variation": cv,
            "max_1day_precipitation_mm": max_1day,
            "max_7day_cumulative_mm": max_7day,
            "rain_days_count": rain_days,
            "heavy_rain_days_count": heavy_days,
            "extreme_rain_days_count": extreme_days,
            "valid_days_count": len(grp)
        })

    monthly_df = pd.DataFrame(monthly_records).sort_values("year_month").reset_index(drop=True)
    clean_monthly_path = os.path.join(out_dir, "gpm_ejura_monthly_clean.csv")
    monthly_df.to_csv(clean_monthly_path, index=False)
    logging.info(f"Saved clean monthly GPM aggregations to {clean_monthly_path} ({len(monthly_df)} months)")

    # Identify Extreme Rainfall Periods (Torrential storms >= 50mm or 7-day total >= 100mm)
    extreme_events = df[(df["is_extreme_rain"] == 1) | (df["rainfall_7day_cumulative_mm"] >= 100.0)].copy()
    extreme_path = os.path.join(out_dir, "gpm_ejura_extreme_rainfall_events.csv")
    extreme_events.to_csv(extreme_path, index=False)
    logging.info(f"Saved extreme rainfall events ({len(extreme_events)} events) to {extreme_path}")

    # Metadata
    meta = {
        "dataset": "NASA GPM IMERG Preprocessed Rainfall Products",
        "location": "Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)",
        "spatial_resolution": "0.1° × 0.1° (~10 km)",
        "temporal_range": f"{df['date'].min()} to {df['date'].max()}",
        "total_days_processed": len(df),
        "total_months_analyzed": len(monthly_df),
        "total_extreme_rain_events_identified": len(extreme_events),
        "output_files": [
            "data/processed/rainfall/gpm_ejura_daily_clean.csv",
            "data/processed/rainfall/gpm_ejura_monthly_clean.csv",
            "data/processed/rainfall/gpm_ejura_extreme_rainfall_events.csv"
        ],
        "metrics_calculated": [
            "Daily precipitation and 7-day/30-day cumulative rainfall",
            "Monthly total, mean, standard deviation, and coefficient of variation (variability)",
            "Rain days, heavy rain days (>=25mm), extreme rain days (>=50mm)",
            "Extreme rainfall periods and soil waterlogging risk events"
        ],
        "preprocessing_timestamp": datetime.utcnow().isoformat() + "Z"
    }

    meta_path = os.path.join(meta_dir, "gpm_preprocessing_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    logging.info(f"Saved GPM preprocessing metadata to {meta_path}")

    return clean_daily_path, clean_monthly_path, extreme_path

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    logging.info("Starting GPM preprocessing...")
    preprocess_gpm(base_dir)
    logging.info("GPM preprocessing completed successfully.")

if __name__ == "__main__":
    main()

