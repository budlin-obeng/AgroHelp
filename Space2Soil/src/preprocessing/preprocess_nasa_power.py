"""
NASA POWER Climate Data Preprocessing for Space2Soil
Cleans, standardizes, and computes monthly climate aggregations for Ejura, Ghana.
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
log_file = os.path.join(LOG_DIR, "preprocessing_nasa_power.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

COLUMN_MAPPING = {
    "DATE": "date",
    "PRECTOTCORR": "precipitation_mm_per_day",
    "T2M": "temperature_mean_c",
    "T2M_MAX": "temperature_max_c",
    "T2M_MIN": "temperature_min_c",
    "RH2M": "relative_humidity_pct"
}

def preprocess_nasa_power(base_dir):
    raw_csv = os.path.join(base_dir, "data", "raw", "nasa_power", "nasa_power_ejura_daily_raw.csv")
    out_dir = os.path.join(base_dir, "data", "processed", "climate")
    meta_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(meta_dir, exist_ok=True)

    logging.info(f"Loading raw NASA POWER dataset from {raw_csv}")
    df_raw = pd.read_csv(raw_csv, dtype={"DATE": str})
    
    # Standardize column names
    df = df_raw.rename(columns=COLUMN_MAPPING)
    
    # Standardize date format to YYYY-MM-DD
    df["date"] = pd.to_datetime(df["date"], format="%Y%m%d").dt.strftime("%Y-%m-%d")
    
    # Handle fill value (-999.0) explicitly: flag and replace with NaN in clean version
    FILL_VALUE = -999.0
    value_cols = [
        "precipitation_mm_per_day",
        "temperature_mean_c",
        "temperature_max_c",
        "temperature_min_c",
        "relative_humidity_pct"
    ]
    
    fill_counts = {}
    for col in value_cols:
        fill_counts[col] = int((df[col] == FILL_VALUE).sum())
        # Replace -999.0 with NaN for clean statistical calculations
        df[col] = df[col].replace(FILL_VALUE, np.nan)
        
    # Derived daily features
    # Diurnal temperature range (DTR)
    df["diurnal_temp_range_c"] = df["temperature_max_c"] - df["temperature_min_c"]
    
    # Flag precipitation event (wet day >= 1.0 mm)
    df["is_wet_day"] = (df["precipitation_mm_per_day"] >= 1.0).astype(int)
    # Extreme precipitation event (>= 25.0 mm - heavy rain threshold in tropical agriculture)
    df["is_heavy_rain_day"] = (df["precipitation_mm_per_day"] >= 25.0).astype(int)
    # Heat stress day (Tmax >= 35.0 °C - critical for maize / yam / cassava pollination & heat stress)
    df["is_heat_stress_day"] = (df["temperature_max_c"] >= 35.0).astype(int)

    # Save clean daily dataset
    clean_daily_path = os.path.join(out_dir, "nasa_power_ejura_daily_clean.csv")
    df.to_csv(clean_daily_path, index=False)
    logging.info(f"Saved clean daily dataset to {clean_daily_path} ({len(df)} rows)")

    # 2. Monthly Aggregations
    df["year_month"] = pd.to_datetime(df["date"]).dt.to_period("M").astype(str)
    
    monthly_grouped = df.groupby("year_month")
    
    monthly_df = pd.DataFrame({
        "year_month": list(monthly_grouped.groups.keys()),
        "precipitation_total_mm": monthly_grouped["precipitation_mm_per_day"].sum(min_count=20),
        "precipitation_mean_daily_mm": monthly_grouped["precipitation_mm_per_day"].mean(),
        "precipitation_max_1day_mm": monthly_grouped["precipitation_mm_per_day"].max(),
        "rain_days_count": monthly_grouped["is_wet_day"].sum(),
        "heavy_rain_days_count": monthly_grouped["is_heavy_rain_day"].sum(),
        "temperature_mean_c": monthly_grouped["temperature_mean_c"].mean(),
        "temperature_max_mean_c": monthly_grouped["temperature_max_c"].mean(),
        "temperature_max_extreme_c": monthly_grouped["temperature_max_c"].max(),
        "temperature_min_mean_c": monthly_grouped["temperature_min_c"].mean(),
        "temperature_min_extreme_c": monthly_grouped["temperature_min_c"].min(),
        "diurnal_temp_range_mean_c": monthly_grouped["diurnal_temp_range_c"].mean(),
        "relative_humidity_mean_pct": monthly_grouped["relative_humidity_pct"].mean(),
        "heat_stress_days_count": monthly_grouped["is_heat_stress_day"].sum(),
        "valid_days_count": monthly_grouped["precipitation_mm_per_day"].count()
    }).reset_index(drop=True)

    # Round floats for clean representation
    float_cols = monthly_df.select_dtypes(include=[np.float64]).columns
    monthly_df[float_cols] = monthly_df[float_cols].round(2)

    clean_monthly_path = os.path.join(out_dir, "nasa_power_ejura_monthly_clean.csv")
    monthly_df.to_csv(clean_monthly_path, index=False)
    logging.info(f"Saved clean monthly aggregation to {clean_monthly_path} ({len(monthly_df)} months)")

    # Save Preprocessing Metadata Summary
    preprocessing_meta = {
        "dataset": "NASA POWER Preprocessed Climate Metrics",
        "location": "Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)",
        "source_raw_file": "data/raw/nasa_power/nasa_power_ejura_daily_raw.csv",
        "output_files": [
            "data/processed/climate/nasa_power_ejura_daily_clean.csv",
            "data/processed/climate/nasa_power_ejura_monthly_clean.csv"
        ],
        "temporal_range": f"{df['date'].min()} to {df['date'].max()}",
        "total_days": len(df),
        "total_months": len(monthly_df),
        "fill_values_converted_to_nan": fill_counts,
        "derived_features": [
            "diurnal_temp_range_c (T2M_MAX - T2M_MIN)",
            "is_wet_day (precipitation >= 1.0 mm)",
            "is_heavy_rain_day (precipitation >= 25.0 mm)",
            "is_heat_stress_day (Tmax >= 35.0 °C)",
            "monthly rainfall total, mean, and max 1-day intensity",
            "monthly thermal extremes and averages",
            "monthly rain days and heat stress days"
        ],
        "preprocessing_timestamp": pd.Timestamp.now().isoformat()
    }

    meta_file = os.path.join(meta_dir, "nasa_power_preprocessing_metadata.json")
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(preprocessing_meta, f, indent=2)

    logging.info(f"Preprocessing metadata saved to {meta_file}")
    return clean_daily_path, clean_monthly_path

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    preprocess_nasa_power(base_dir)

