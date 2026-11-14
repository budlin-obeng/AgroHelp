"""
NASA Soil Moisture Active Passive (SMAP) & GMAO Land Surface Moisture Acquisition
Pilot Location: Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)
Historical Period: 2016-01-01 to 2025-12-31

Variables:
- Surface Soil Moisture / Wetness: Top 0–5 cm depth (GWETTOP / SPL3SMP_E)
- Root-Zone Soil Moisture / Wetness: 0–100 cm profile depth (GWETROOT / SPL4SMAU)
"""

import os
import sys
import json
import logging
from datetime import datetime
import requests
import pandas as pd

# Setup logging
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "acquisition_smap.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

TARGET_CONFIG = {
    "location_name": "Ejura, Ashanti Region, Ghana",
    "latitude": 7.3856,
    "longitude": -1.3562,
    "start_date": "20160101",
    "end_date": "20251231",
    "parameters": ["GWETTOP", "GWETROOT"]
}

def check_earthdata_credentials():
    netrc_exists = os.path.exists(os.path.expanduser("~/.netrc")) or os.path.exists(os.path.expanduser("~/_netrc"))
    env_exists = "EARTHDATA_USERNAME" in os.environ and "EARTHDATA_PASSWORD" in os.environ
    return netrc_exists or env_exists

def fetch_smap_cmr_granules(short_name="SPL4SMAU", limit=20):
    cmr_url = "https://cmr.earthdata.nasa.gov/search/granules.json"
    params = {
        "short_name": short_name,
        "point": f"{TARGET_CONFIG['longitude']},{TARGET_CONFIG['latitude']}",
        "temporal": "2023-01-01T00:00:00Z,2023-01-15T23:59:59Z",
        "page_size": limit
    }
    try:
        resp = requests.get(cmr_url, params=params, timeout=30)
        if resp.status_code == 200:
            return resp.json().get("feed", {}).get("entry", [])
    except Exception as e:
        logging.warning(f"CMR SMAP query error: {e}")
    return []

def acquire_soil_moisture(base_dir):
    raw_dir = os.path.join(base_dir, "data", "raw", "smap")
    meta_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(meta_dir, exist_ok=True)

    has_auth = check_earthdata_credentials()
    logging.info(f"NASA Earthdata Login Authentication Status: {'Configured' if has_auth else 'Not Configured (Pending)'}")

    # Catalog SMAP granules from NSIDC via CMR
    granules = fetch_smap_cmr_granules("SPL4SMAU", limit=30)
    smap_catalog = []
    for g in granules:
        title = g.get("title", "")
        links = [l.get("href") for l in g.get("links", []) if l.get("href", "").endswith(".h5")]
        smap_catalog.append({
            "granule_id": title,
            "start_time": g.get("time_start"),
            "end_time": g.get("time_end"),
            "nsidc_download_url": links[0] if links else None
        })
    cat_path = os.path.join(raw_dir, "smap_nsidc_granule_catalog.csv")
    pd.DataFrame(smap_catalog).to_csv(cat_path, index=False)
    logging.info(f"Saved SMAP NSIDC granule catalog to {cat_path}")

    # Retrieve official daily surface and root-zone soil wetness from NASA POWER API
    url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": ",".join(TARGET_CONFIG["parameters"]),
        "community": "AG",
        "longitude": TARGET_CONFIG["longitude"],
        "latitude": TARGET_CONFIG["latitude"],
        "start": TARGET_CONFIG["start_date"],
        "end": TARGET_CONFIG["end_date"],
        "format": "JSON"
    }

    logging.info(f"Requesting NASA Soil Moisture parameters ({TARGET_CONFIG['parameters']}) for Ejura...")
    resp = requests.get(url, params=params, timeout=120)
    if resp.status_code != 200:
        logging.error(f"NASA POWER Soil Moisture request failed: {resp.status_code}")
        sys.exit(1)

    raw_json = resp.json()
    raw_json_path = os.path.join(raw_dir, "smap_soil_moisture_ejura_raw.json")
    with open(raw_json_path, "w", encoding="utf-8") as f:
        json.dump(raw_json, f, indent=2)
    logging.info(f"Saved raw soil moisture JSON to {raw_json_path}")

    # Parse into tabular format
    param_dict = raw_json.get("properties", {}).get("parameter", {})
    df = pd.DataFrame(param_dict)
    df.index.name = "DATE"
    df.reset_index(inplace=True)

    raw_csv_path = os.path.join(raw_dir, "smap_soil_moisture_ejura_raw.csv")
    df.to_csv(raw_csv_path, index=False)
    logging.info(f"Saved raw soil moisture CSV to {raw_csv_path} ({len(df)} records)")

    # Save metadata
    meta = {
        "dataset_name": "NASA Soil Moisture: Surface & Root-Zone Climatology",
        "mission_context": "NASA SMAP / GMAO Land Surface Assimilation",
        "target_location": TARGET_CONFIG["location_name"],
        "coordinates": {"latitude": TARGET_CONFIG["latitude"], "longitude": TARGET_CONFIG["longitude"]},
        "temporal_range": f"{df['DATE'].min()} to {df['DATE'].max()}",
        "total_records": len(df),
        "variables_and_depths": {
            "GWETTOP": {
                "description": "Surface Soil Wetness",
                "depth_represented": "Top 0 to 5 cm soil layer",
                "units": "Fraction / dimensionless (0.0 to 1.0)",
                "smap_equivalent": "SMAP L3 Radiometer Surface Soil Moisture (SPL3SMP_E 0-5cm)",
                "agronomic_role": "Seedbed moisture, seed germination, evaporation, tillage workability"
            },
            "GWETROOT": {
                "description": "Root-Zone Soil Wetness",
                "depth_represented": "0 to 100 cm profile depth",
                "units": "Fraction / dimensionless (0.0 to 1.0)",
                "smap_equivalent": "SMAP L4 Global Root-Zone Soil Moisture (SPL4SMAU 0-100cm)",
                "agronomic_role": "Crop transpiration, agricultural drought onset, deep root water uptake (maize/cassava/yam)"
            }
        },
        "retrieval_timestamp": datetime.utcnow().isoformat() + "Z"
    }

    meta_path = os.path.join(meta_dir, "smap_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    logging.info(f"Saved SMAP metadata to {meta_path}")

    return raw_csv_path, meta_path, df

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    logging.info("Starting Soil Moisture acquisition...")
    acquire_soil_moisture(base_dir)
    logging.info("Soil Moisture acquisition completed successfully.")

if __name__ == "__main__":
    main()

