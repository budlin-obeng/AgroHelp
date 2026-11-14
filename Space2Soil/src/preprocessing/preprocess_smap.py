"""
NASA Soil Moisture Preprocessing for Space2Soil
Cleans surface and root-zone moisture, computes 10-year climatological anomalies (Z-scores),
and identifies agricultural drought periods for Ejura, Ghana.
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
log_file = os.path.join(LOG_DIR, "preprocessing_smap.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

# Characteristic porosity (saturated moisture content theta_sat) for Ejura Ochrosols (sandy loam)
THETA_SAT = 0.43  # m^3/m^3

def preprocess_smap(base_dir):
    raw_csv = os.path.join(base_dir, "data", "raw", "smap", "smap_soil_moisture_ejura_raw.csv")
    out_dir = os.path.join(base_dir, "data", "processed", "soil_moisture")
    meta_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(meta_dir, exist_ok=True)

    logging.info(f"Loading raw soil moisture data from {raw_csv}")
    df_raw = pd.read_csv(raw_csv, dtype={"DATE": str})

    # Standardize daily dataset
    df = pd.DataFrame({
        "date": pd.to_datetime(df_raw["DATE"], format="%Y%m%d").dt.strftime("%Y-%m-%d"),
        "surface_soil_wetness_fraction_0_5cm": df_raw["GWETTOP"].round(4),
        "rootzone_soil_wetness_fraction_0_100cm": df_raw["GWETROOT"].round(4)
    })

    # Convert to volumetric soil moisture (m^3 / m^3)
    df["surface_volumetric_moisture_m3_m3"] = (df["surface_soil_wetness_fraction_0_5cm"] * THETA_SAT).round(4)
    df["rootzone_volumetric_moisture_m3_m3"] = (df["rootzone_soil_wetness_fraction_0_100cm"] * THETA_SAT).round(4)

    # Calculate 10-Year Climatological Mean & Std by Day of Year (DOY) for Anomalies
    df["doy"] = pd.to_datetime(df["date"]).dt.dayofyear
    doy_stats = df.groupby("doy").agg({
        "rootzone_soil_wetness_fraction_0_100cm": ["mean", "std"],
        "surface_soil_wetness_fraction_0_5cm": ["mean", "std"]
    })
    doy_stats.columns = ["rz_mean", "rz_std", "sf_mean", "sf_std"]

    df = df.merge(doy_stats, on="doy", how="left")

    # Standardized Anomaly Z-scores: Z = (X - DOY_mean) / DOY_std
    df["rootzone_moisture_anomaly_zscore"] = np.where(
        df["rz_std"] > 0,
        ((df["rootzone_soil_wetness_fraction_0_100cm"] - df["rz_mean"]) / df["rz_std"]).round(2),
        0.0
    )
    df["surface_moisture_anomaly_zscore"] = np.where(
        df["sf_std"] > 0,
        ((df["surface_soil_wetness_fraction_0_5cm"] - df["sf_mean"]) / df["sf_std"]).round(2),
        0.0
    )

    # Classify Agricultural Drought and Moisture Stress
    def classify_drought(z):
        if z <= -2.0:
            return "Extreme_Agricultural_Drought"
        elif z <= -1.0:
            return "Moderate_Agricultural_Drought"
        elif z >= 1.5:
            return "Soil_Moisture_Surplus"
        else:
            return "Normal_Moisture"

    df["moisture_stress_class"] = df["rootzone_moisture_anomaly_zscore"].apply(classify_drought)
    df["is_agricultural_drought"] = (df["rootzone_moisture_anomaly_zscore"] <= -1.0).astype(int)

    # Clean up auxiliary merge columns
    df.drop(columns=["doy", "rz_mean", "rz_std", "sf_mean", "sf_std"], inplace=True)

    clean_daily_path = os.path.join(out_dir, "smap_ejura_daily_clean.csv")
    df.to_csv(clean_daily_path, index=False)
    logging.info(f"Saved clean daily soil moisture to {clean_daily_path} ({len(df)} records)")

    # Monthly Aggregation
    df["year_month"] = pd.to_datetime(df["date"]).dt.to_period("M").astype(str)
    monthly_grouped = df.groupby("year_month")

    monthly_records = []
    for ym, grp in monthly_grouped:
        monthly_records.append({
            "year_month": ym,
            "year": int(ym[:4]),
            "month": int(ym[5:7]),
            "surface_wetness_mean": round(grp["surface_soil_wetness_fraction_0_5cm"].mean(), 4),
            "surface_volumetric_mean_m3_m3": round(grp["surface_volumetric_moisture_m3_m3"].mean(), 4),
            "rootzone_wetness_mean": round(grp["rootzone_soil_wetness_fraction_0_100cm"].mean(), 4),
            "rootzone_volumetric_mean_m3_m3": round(grp["rootzone_volumetric_moisture_m3_m3"].mean(), 4),
            "rootzone_anomaly_zscore_mean": round(grp["rootzone_moisture_anomaly_zscore"].mean(), 2),
            "drought_days_count": int(grp["is_agricultural_drought"].sum()),
            "valid_days_count": len(grp)
        })

    monthly_df = pd.DataFrame(monthly_records).sort_values("year_month").reset_index(drop=True)
    clean_monthly_path = os.path.join(out_dir, "smap_ejura_monthly_clean.csv")
    monthly_df.to_csv(clean_monthly_path, index=False)
    logging.info(f"Saved clean monthly soil moisture to {clean_monthly_path} ({len(monthly_df)} months)")

    # Identify Major Soil Drought Periods
    drought_events = df[df["is_agricultural_drought"] == 1].copy()
    drought_path = os.path.join(out_dir, "smap_ejura_drought_events.csv")
    drought_events.to_csv(drought_path, index=False)
    logging.info(f"Saved agricultural drought events ({len(drought_events)} days) to {drought_path}")

    # Metadata
    meta = {
        "dataset": "NASA Preprocessed Soil Moisture Climatology & Anomalies",
        "location": "Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)",
        "spatial_resolution": "9 km (SMAP L4 grid / GMAO MERRA-2 assimilation)",
        "depths_represented": {
            "surface": "0-5 cm soil layer (seed germination / surface crusting)",
            "rootzone": "0-100 cm profile depth (active crop root water uptake)"
        },
        "soil_conversion": f"Volumetric moisture calculated using characteristic porosity theta_sat = {THETA_SAT} m^3/m^3 for Ejura Ochrosols",
        "anomaly_baseline": "10-Year Day-of-Year (DOY) Climatological Mean & Standard Deviation (2016-2025)",
        "total_days_processed": len(df),
        "total_months_analyzed": len(monthly_df),
        "total_drought_days_identified": len(drought_events),
        "output_files": [
            "data/processed/soil_moisture/smap_ejura_daily_clean.csv",
            "data/processed/soil_moisture/smap_ejura_monthly_clean.csv",
            "data/processed/soil_moisture/smap_ejura_drought_events.csv"
        ],
        "preprocessing_timestamp": datetime.utcnow().isoformat() + "Z"
    }

    meta_path = os.path.join(meta_dir, "smap_preprocessing_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    logging.info(f"Saved Soil Moisture preprocessing metadata to {meta_path}")

    return clean_daily_path, clean_monthly_path, drought_path

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    logging.info("Starting Soil Moisture preprocessing...")
    preprocess_smap(base_dir)
    logging.info("Soil Moisture preprocessing completed successfully.")

if __name__ == "__main__":
    main()

