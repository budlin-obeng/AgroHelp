"""
Landsat Scene Catalog and Quality Validation Script for Space2Soil
Validates acquired Landsat 8/9 Collection 2 Level-2 inventory for Ejura, Ghana.
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
log_file = os.path.join(LOG_DIR, "validation_landsat.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def validate_landsat(base_dir):
    raw_csv = os.path.join(base_dir, "data", "raw", "landsat", "landsat_ejura_scene_catalog.csv")
    meta_json = os.path.join(base_dir, "data", "metadata", "landsat_metadata.json")
    
    report = {
        "dataset": "Landsat 8 & 9 Collection 2 Level-2 Surface Reflectance",
        "catalog_exists": os.path.exists(raw_csv),
        "metadata_exists": os.path.exists(meta_json),
        "validation_timestamp": pd.Timestamp.now().isoformat(),
        "checks": {}
    }

    if not report["catalog_exists"]:
        logging.error(f"Catalog file not found: {raw_csv}")
        return report

    df = pd.read_csv(raw_csv)
    report["total_scenes_cataloged"] = len(df)
    logging.info(f"Loaded {len(df)} Landsat scenes from {raw_csv}")

    # 1. Temporal & Platform Coverage
    df["datetime"] = pd.to_datetime(df["datetime"])
    df["year"] = df["datetime"].dt.year
    df["month"] = df["datetime"].dt.month
    
    platform_counts = df["platform"].value_counts().to_dict()
    yearly_counts = df["year"].value_counts().sort_index().to_dict()
    
    report["temporal_check"] = {
        "start_date": str(df["date"].min()),
        "end_date": str(df["date"].max()),
        "years_covered": list(yearly_counts.keys()),
        "scenes_per_year": yearly_counts,
        "platform_distribution": platform_counts
    }

    # 2. Cloud Cover Analysis (Tropical West Africa Agricultural Context)
    clear_count = int((df["cloud_cover_pct"] <= 20.0).sum())
    usable_count = int(((df["cloud_cover_pct"] > 20.0) & (df["cloud_cover_pct"] <= 50.0)).sum())
    heavy_cloud_count = int((df["cloud_cover_pct"] > 50.0).sum())

    report["cloud_cover_analysis"] = {
        "min_cloud_cover_pct": float(df["cloud_cover_pct"].min()),
        "max_cloud_cover_pct": float(df["cloud_cover_pct"].max()),
        "mean_cloud_cover_pct": round(float(df["cloud_cover_pct"].mean()), 2),
        "median_cloud_cover_pct": round(float(df["cloud_cover_pct"].median()), 2),
        "clear_scenes_le_20pct": clear_count,
        "clear_scenes_pct": round(clear_count / len(df) * 100, 2),
        "moderate_scenes_20_50pct": usable_count,
        "overcast_scenes_gt_50pct": heavy_cloud_count
    }

    # 3. Seasonal Distribution (Ghana Agro-ecological Seasons)
    # Major Rainy Season: Apr - Jul
    # Minor Rainy Season: Sep - Oct
    # Dry Harmattan Season: Nov - Mar
    def assign_season(m):
        if m in [4, 5, 6, 7]:
            return "Major_Rainy_Season"
        elif m in [9, 10]:
            return "Minor_Rainy_Season"
        elif m in [8]:
            return "Mid_Summer_Dry_Spell"
        else:
            return "Dry_Harmattan_Season"
            
    df["season"] = df["month"].apply(assign_season)
    season_counts = df["season"].value_counts().to_dict()
    clear_per_season = df[df["cloud_cover_pct"] <= 20.0]["season"].value_counts().to_dict()

    report["seasonal_distribution"] = {
        "all_scenes_by_season": season_counts,
        "clear_scenes_by_season": clear_per_season,
        "harmattan_clear_ratio": round(clear_per_season.get("Dry_Harmattan_Season", 0) / season_counts.get("Dry_Harmattan_Season", 1) * 100, 2),
        "rainy_season_clear_ratio": round(clear_per_season.get("Major_Rainy_Season", 0) / season_counts.get("Major_Rainy_Season", 1) * 100, 2)
    }

    # 4. Asset Completeness Check
    asset_checks = {
        "red_href_present": int(df["red_asset_href"].notna().sum()),
        "nir_href_present": int(df["nir_asset_href"].notna().sum()),
        "blue_href_present": int(df["blue_asset_href"].notna().sum()),
        "qa_pixel_href_present": int(df["qa_pixel_asset_href"].notna().sum())
    }
    report["asset_checks"] = asset_checks

    # Save validation report
    val_report_path = os.path.join(base_dir, "data", "metadata", "landsat_validation_report.json")
    with open(val_report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logging.info(f"Landsat validation report saved to {val_report_path}")
    logging.info(json.dumps(report, indent=2))
    return report

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    validate_landsat(base_dir)

