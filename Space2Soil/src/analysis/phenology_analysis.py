"""
Phase 3: Landsat Decadal Phenology & Canopy Dynamics Analysis for Space2Soil
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
log_file = os.path.join(LOG_DIR, "analysis_phenology.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def run_phenology_analysis(base_dir):
    ts_csv = os.path.join(base_dir, "data", "processed", "vegetation", "landsat_ejura_vegetation_timeseries.csv")
    out_dir = os.path.join(base_dir, "data", "processed", "analysis")
    os.makedirs(out_dir, exist_ok=True)

    logging.info(f"Loading Landsat vegetation time series from {ts_csv}")
    df = pd.read_csv(ts_csv)
    df["dt"] = pd.to_datetime(df["date"])

    # 1. Decadal Climatological Phenology Envelope by Calendar Month (1 to 12)
    month_stats = df.groupby("month").agg({
        "ndvi_mean": ["mean", "std", "min", "max", lambda x: np.percentile(x, 10), lambda x: np.percentile(x, 90)],
        "evi_mean": ["mean", "std"],
        "scene_id": "count"
    })
    month_stats.columns = [
        "ndvi_climatological_mean", "ndvi_std", "ndvi_min", "ndvi_max",
        "ndvi_10th_percentile_stress", "ndvi_90th_percentile_optimal",
        "evi_climatological_mean", "evi_std", "clear_scenes_observed"
    ]
    month_stats = month_stats.round(4).reset_index()

    envelope_path = os.path.join(out_dir, "vegetation_phenology_envelope.csv")
    month_stats.to_csv(envelope_path, index=False)
    logging.info(f"Saved decadal phenology envelope to {envelope_path}")

    # 2. Annual Canopy Performance & Greenness Duration
    yearly_perf = []
    for y, grp in df.groupby("year"):
        peak_ndvi = grp["ndvi_mean"].max()
        min_ndvi = grp["ndvi_mean"].min()
        mean_ndvi = grp["ndvi_mean"].mean()
        high_canopy_count = int((grp["ndvi_mean"] >= 0.65).sum())

        yearly_perf.append({
            "year": y,
            "annual_mean_ndvi": round(float(mean_ndvi), 4),
            "peak_canopy_ndvi": round(float(peak_ndvi), 4),
            "dry_season_trough_ndvi": round(float(min_ndvi), 4),
            "seasonal_amplitude_ndvi": round(float(peak_ndvi - min_ndvi), 4),
            "scenes_with_dense_canopy_ge_0_65": high_canopy_count,
            "total_clear_observations": len(grp)
        })

    df_yearly = pd.DataFrame(yearly_perf).sort_values("year").reset_index(drop=True)
    perf_path = os.path.join(out_dir, "annual_canopy_performance.csv")
    df_yearly.to_csv(perf_path, index=False)
    logging.info(f"Saved annual canopy performance to {perf_path}")

    return envelope_path, perf_path

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    run_phenology_analysis(base_dir)

