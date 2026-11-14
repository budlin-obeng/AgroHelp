"""
NASA GPM IMERG Data Validation Script for Space2Soil
Validates downloaded GPM precipitation dataset for Ejura, Ghana.
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
log_file = os.path.join(LOG_DIR, "validation_gpm.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def validate_gpm(base_dir):
    raw_csv = os.path.join(base_dir, "data", "raw", "gpm", "gpm_imerg_ejura_daily_raw.csv")
    meta_json = os.path.join(base_dir, "data", "metadata", "gpm_metadata.json")
    val_report_path = os.path.join(base_dir, "data", "metadata", "gpm_validation_report.json")

    report = {
        "dataset": "NASA GPM IMERG Daily Precipitation",
        "file_exists": os.path.exists(raw_csv),
        "metadata_exists": os.path.exists(meta_json),
        "validation_timestamp": pd.Timestamp.now().isoformat(),
        "checks": {}
    }

    if not report["file_exists"]:
        logging.error(f"GPM raw file not found: {raw_csv}")
        return report

    df = pd.read_csv(raw_csv, dtype={"DATE": str})
    report["total_records"] = len(df)
    logging.info(f"Loaded {len(df)} records from {raw_csv}")

    # 1. Date Continuity & Coverage
    dates = pd.to_datetime(df["DATE"], format="%Y%m%d", errors="coerce")
    expected_days = (dates.max() - dates.min()).days + 1
    report["date_check"] = {
        "start_date": str(df["DATE"].min()),
        "end_date": str(df["DATE"].max()),
        "expected_date_count": expected_days,
        "actual_date_count": len(dates),
        "date_gaps": expected_days - len(dates)
    }

    # 2. Precipitation Physical Range Checks
    col = "GPM_IMERG_PRECIPITATION_MM"
    precip = df[col]
    null_count = int(precip.isna().sum())
    negative_count = int((precip < 0.0).sum())
    valid_precip = precip[precip >= 0.0]

    report["precipitation_checks"] = {
        "unit": "mm/day",
        "completeness_pct": round(len(valid_precip) / len(df) * 100, 2),
        "null_count": null_count,
        "negative_values_count": negative_count,
        "min_daily_mm": float(valid_precip.min()),
        "max_daily_mm": float(valid_precip.max()),
        "mean_daily_mm": round(float(valid_precip.mean()), 2),
        "total_10yr_rainfall_mm": round(float(valid_precip.sum()), 2),
        "annual_average_rainfall_mm": round(float(valid_precip.sum() / 10.0), 2)
    }

    # 3. Rainfall Variability & Extreme Rainfall Analysis
    # Wet day threshold: >= 1.0 mm
    wet_days = valid_precip[valid_precip >= 1.0]
    # Heavy rainfall: >= 25 mm
    heavy_rain_days = valid_precip[valid_precip >= 25.0]
    # Extreme torrential rainfall: >= 50 mm (>99th percentile)
    extreme_rain_days = valid_precip[valid_precip >= 50.0]

    # Coefficient of Variation (CV = std / mean)
    cv = float(valid_precip.std() / valid_precip.mean())

    report["rainfall_variability_and_extremes"] = {
        "total_wet_days_ge_1mm": len(wet_days),
        "wet_days_frequency_pct": round(len(wet_days) / len(valid_precip) * 100, 2),
        "heavy_rain_days_ge_25mm": len(heavy_rain_days),
        "extreme_torrential_days_ge_50mm": len(extreme_rain_days),
        "coefficient_of_variation_daily": round(cv, 2),
        "90th_percentile_wet_day_mm": round(float(wet_days.quantile(0.90)), 2),
        "95th_percentile_wet_day_mm": round(float(wet_days.quantile(0.95)), 2),
        "99th_percentile_wet_day_mm": round(float(wet_days.quantile(0.99)), 2)
    }

    with open(val_report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logging.info(f"GPM validation report saved to {val_report_path}")
    logging.info(json.dumps(report, indent=2))
    return report

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    validate_gpm(base_dir)

