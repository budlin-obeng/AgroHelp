"""
NASA Soil Moisture Data Validation Script for Space2Soil
Validates acquired surface (0-5cm) and root-zone (0-100cm) soil moisture datasets for Ejura, Ghana.
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
log_file = os.path.join(LOG_DIR, "validation_smap.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def validate_smap(base_dir):
    raw_csv = os.path.join(base_dir, "data", "raw", "smap", "smap_soil_moisture_ejura_raw.csv")
    meta_json = os.path.join(base_dir, "data", "metadata", "smap_metadata.json")
    val_report_path = os.path.join(base_dir, "data", "metadata", "smap_validation_report.json")

    report = {
        "dataset": "NASA Soil Moisture (Surface 0-5cm & Root-Zone 0-100cm)",
        "file_exists": os.path.exists(raw_csv),
        "metadata_exists": os.path.exists(meta_json),
        "validation_timestamp": pd.Timestamp.now().isoformat(),
        "checks": {}
    }

    if not report["file_exists"]:
        logging.error(f"Soil moisture file not found: {raw_csv}")
        return report

    df = pd.read_csv(raw_csv, dtype={"DATE": str})
    report["total_records"] = len(df)
    logging.info(f"Loaded {len(df)} records from {raw_csv}")

    # 1. Date Checks
    dates = pd.to_datetime(df["DATE"], format="%Y%m%d", errors="coerce")
    expected_days = (dates.max() - dates.min()).days + 1
    report["date_check"] = {
        "start_date": str(df["DATE"].min()),
        "end_date": str(df["DATE"].max()),
        "expected_date_count": expected_days,
        "actual_date_count": len(dates),
        "date_gaps": expected_days - len(dates)
    }

    # 2. Variable Physical Bounds Checks (Fraction: 0.0 to 1.0)
    FILL_VALUE = -999.0
    var_checks = {}
    for var, desc, depth in [
        ("GWETTOP", "Surface Soil Wetness", "0-5 cm"),
        ("GWETROOT", "Root-Zone Soil Wetness", "0-100 cm profile")
    ]:
        if var not in df.columns:
            var_checks[var] = {"status": "MISSING"}
            continue
            
        series = df[var]
        fill_count = int((series == FILL_VALUE).sum())
        null_count = int(series.isna().sum())
        valid_series = series[(series != FILL_VALUE) & (~series.isna())]
        out_of_bounds = int(((valid_series < 0.0) | (valid_series > 1.0)).sum())

        var_checks[var] = {
            "description": desc,
            "depth_represented": depth,
            "units": "Fraction (0.0 to 1.0)",
            "completeness_pct": round(len(valid_series) / len(df) * 100, 2),
            "fill_count": fill_count,
            "null_count": null_count,
            "out_of_bounds_count": out_of_bounds,
            "min_observed": float(valid_series.min()) if len(valid_series) > 0 else None,
            "max_observed": float(valid_series.max()) if len(valid_series) > 0 else None,
            "mean_observed": round(float(valid_series.mean()), 4) if len(valid_series) > 0 else None,
            "std_observed": round(float(valid_series.std()), 4) if len(valid_series) > 0 else None,
            "10th_percentile (dry stress)": round(float(valid_series.quantile(0.10)), 4) if len(valid_series) > 0 else None,
            "50th_percentile (median)": round(float(valid_series.quantile(0.50)), 4) if len(valid_series) > 0 else None,
            "90th_percentile (saturated)": round(float(valid_series.quantile(0.90)), 4) if len(valid_series) > 0 else None
        }

    report["variable_checks"] = var_checks

    with open(val_report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logging.info(f"Soil moisture validation report saved to {val_report_path}")
    logging.info(json.dumps(report, indent=2))
    return report

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    validate_smap(base_dir)

