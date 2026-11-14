"""
NASA POWER Data Validation Script for Space2Soil
Validates downloaded raw NASA POWER dataset for Ejura, Ghana.
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
log_file = os.path.join(LOG_DIR, "validation_nasa_power.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

PHYSICAL_LIMITS = {
    "PRECTOTCORR": {"min": 0.0, "max": 500.0, "unit": "mm/day", "desc": "Precipitation Corrected"},
    "T2M": {"min": 5.0, "max": 50.0, "unit": "°C", "desc": "Temperature at 2 Meters"},
    "T2M_MAX": {"min": 5.0, "max": 55.0, "unit": "°C", "desc": "Maximum Temperature at 2 Meters"},
    "T2M_MIN": {"min": 5.0, "max": 45.0, "unit": "°C", "desc": "Minimum Temperature at 2 Meters"},
    "RH2M": {"min": 0.0, "max": 100.0, "unit": "%", "desc": "Relative Humidity at 2 Meters"}
}

def validate_nasa_power(base_dir):
    raw_csv = os.path.join(base_dir, "data", "raw", "nasa_power", "nasa_power_ejura_daily_raw.csv")
    meta_json = os.path.join(base_dir, "data", "metadata", "nasa_power_metadata.json")
    validation_dir = os.path.join(base_dir, "data", "processed", "climate")
    os.makedirs(validation_dir, exist_ok=True)

    report = {
        "dataset": "NASA POWER Daily Agroclimatology",
        "file_exists": os.path.exists(raw_csv),
        "file_size_bytes": os.path.getsize(raw_csv) if os.path.exists(raw_csv) else 0,
        "metadata_exists": os.path.exists(meta_json),
        "validation_timestamp": pd.Timestamp.now().isoformat(),
        "checks": {}
    }

    if not report["file_exists"]:
        logging.error(f"Raw data file not found: {raw_csv}")
        return report

    # Load data
    df = pd.read_csv(raw_csv, dtype={"DATE": str})
    report["total_records"] = len(df)
    logging.info(f"Loaded {len(df)} records from {raw_csv}")

    # Check Date coverage
    dates = pd.to_datetime(df["DATE"], format="%Y%m%d", errors="coerce")
    invalid_dates = df[dates.isna()]
    report["date_check"] = {
        "start_date": str(df["DATE"].min()),
        "end_date": str(df["DATE"].max()),
        "invalid_date_formats": len(invalid_dates),
        "expected_date_count": (dates.max() - dates.min()).days + 1 if len(dates.dropna()) > 0 else 0,
        "actual_date_count": len(dates),
        "date_gaps_count": ((dates.max() - dates.min()).days + 1 - len(dates)) if len(dates.dropna()) > 0 else 0
    }

    # Check parameters and fill values (-999.0)
    FILL_VALUE = -999.0
    param_checks = {}
    for col in PHYSICAL_LIMITS.keys():
        if col not in df.columns:
            param_checks[col] = {"status": "MISSING_COLUMN"}
            continue
        
        series = df[col]
        fill_count = int((series == FILL_VALUE).sum())
        nan_count = int(series.isna().sum())
        valid_series = series[(series != FILL_VALUE) & (~series.isna())]
        
        limits = PHYSICAL_LIMITS[col]
        out_of_bounds = int(((valid_series < limits["min"]) | (valid_series > limits["max"])).sum())
        
        # Check thermal consistency: T2M_MAX >= T2M >= T2M_MIN
        thermal_inconsistencies = 0
        if col == "T2M_MAX" and "T2M_MIN" in df.columns:
            inconsistent = df[(df["T2M_MAX"] != FILL_VALUE) & (df["T2M_MIN"] != FILL_VALUE) & (df["T2M_MAX"] < df["T2M_MIN"])]
            thermal_inconsistencies = len(inconsistent)

        param_checks[col] = {
            "unit": limits["unit"],
            "fill_value_count (-999.0)": fill_count,
            "null_count": nan_count,
            "valid_observations": len(valid_series),
            "completeness_pct": round(len(valid_series) / len(df) * 100, 2),
            "min_observed": float(valid_series.min()) if len(valid_series) > 0 else None,
            "max_observed": float(valid_series.max()) if len(valid_series) > 0 else None,
            "mean_observed": round(float(valid_series.mean()), 2) if len(valid_series) > 0 else None,
            "out_of_physical_bounds": out_of_bounds,
            "physical_limits": f"{limits['min']} to {limits['max']} {limits['unit']}",
            "thermal_inconsistencies": thermal_inconsistencies if col == "T2M_MAX" else None
        }

    report["parameter_checks"] = param_checks

    # Save validation report
    val_report_path = os.path.join(base_dir, "data", "metadata", "nasa_power_validation_report.json")
    os.makedirs(os.path.dirname(val_report_path), exist_ok=True)
    with open(val_report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logging.info(f"Validation report saved to {val_report_path}")
    logging.info(json.dumps(report, indent=2))
    return report

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    validate_nasa_power(base_dir)
