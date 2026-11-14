"""
NASA POWER Daily Agroclimatology Data Acquisition Script for Space2Soil
Pilot Location: Ejura, Ashanti Region, Ghana
Coordinates: Lat 7.3856, Lon -1.3562
Parameters: PRECTOTCORR, T2M, T2M_MAX, T2M_MIN, RH2M
Period: 2016-01-01 to 2025-12-31 (or latest available)
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
log_file = os.path.join(LOG_DIR, "acquisition_nasa_power.log")

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
    "parameters": ["PRECTOTCORR", "T2M", "T2M_MAX", "T2M_MIN", "RH2M"],
    "community": "AG"  # Agroclimatology community
}

def fetch_nasa_power(config):
    url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": ",".join(config["parameters"]),
        "community": config["community"],
        "longitude": config["longitude"],
        "latitude": config["latitude"],
        "start": config["start_date"],
        "end": config["end_date"],
        "format": "JSON"
    }

    logging.info(f"Initiating request to NASA POWER API: {url}")
    logging.info(f"Target location: {config['location_name']} (Lat: {config['latitude']}, Lon: {config['longitude']})")
    logging.info(f"Parameters requested: {config['parameters']}")
    logging.info(f"Date range: {config['start_date']} - {config['end_date']}")

    try:
        response = requests.get(url, params=params, timeout=120)
        logging.info(f"HTTP Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            logging.error(f"Failed to fetch data: HTTP {response.status_code} - {response.text}")
            # Try to see if date range caused error
            try:
                err_json = response.json()
                logging.error(f"API Error details: {json.dumps(err_json, indent=2)}")
            except Exception:
                pass
            return None
    except Exception as e:
        logging.error(f"Exception during request: {e}", exc_info=True)
        return None

def process_raw_power_data(raw_json, base_dir):
    raw_dir = os.path.join(base_dir, "data", "raw", "nasa_power")
    metadata_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(metadata_dir, exist_ok=True)

    # 1. Save raw JSON response
    json_path = os.path.join(raw_dir, "nasa_power_ejura_daily_raw.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(raw_json, f, indent=2)
    logging.info(f"Saved raw JSON response to {json_path}")

    # 2. Extract metadata
    header = raw_json.get("header", {})
    parameters_meta = raw_json.get("parameters", {})
    geometry = raw_json.get("geometry", {})
    time_info = raw_json.get("time", {})

    metadata = {
        "dataset_name": "NASA POWER Daily Agroclimatology (Point)",
        "source": "NASA Langley Research Center POWER Project",
        "api_endpoint": "https://power.larc.nasa.gov/api/temporal/daily/point",
        "retrieval_timestamp": datetime.utcnow().isoformat() + "Z",
        "target_location": TARGET_CONFIG["location_name"],
        "target_coordinates": {
            "requested_latitude": TARGET_CONFIG["latitude"],
            "requested_longitude": TARGET_CONFIG["longitude"],
            "actual_geometry": geometry
        },
        "spatial_resolution": "0.5 x 0.625 degree (MERRA-2 atmospheric assimilation model grid; ~50km x ~60km)",
        "temporal_resolution": "Daily",
        "fill_value": -999.0,
        "parameters": parameters_meta,
        "api_header": header
    }

    meta_path = os.path.join(metadata_dir, "nasa_power_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logging.info(f"Saved metadata to {meta_path}")

    # 3. Convert properties/parameter series to tabular DataFrame
    properties = raw_json.get("properties", {})
    parameter_dict = properties.get("parameter", {})

    # parameter_dict has structure: {'PRECTOTCORR': {'20160101': val, ...}, ...}
    df = pd.DataFrame(parameter_dict)
    df.index.name = "DATE"
    df.reset_index(inplace=True)
    
    # Save raw tabular CSV exactly as received
    csv_raw_path = os.path.join(raw_dir, "nasa_power_ejura_daily_raw.csv")
    df.to_csv(csv_raw_path, index=False)
    logging.info(f"Saved raw tabular CSV to {csv_raw_path} with {len(df)} records.")
    
    return csv_raw_path, meta_path, df

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    logging.info("Starting NASA POWER acquisition...")
    raw_json = fetch_nasa_power(TARGET_CONFIG)
    
    if raw_json is None:
        # Fallback: check if end_date needs adjustment to available range
        logging.warning("Initial query failed. Checking end date constraint...")
        current_year = datetime.now().year
        TARGET_CONFIG["end_date"] = f"{current_year-1}1231"
        logging.info(f"Retrying with end_date: {TARGET_CONFIG['end_date']}")
        raw_json = fetch_nasa_power(TARGET_CONFIG)

    if raw_json:
        csv_path, meta_path, df = process_raw_power_data(raw_json, base_dir)
        logging.info("NASA POWER acquisition completed successfully.")
        logging.info(f"Columns: {list(df.columns)}")
        logging.info(f"Date range in data: {df['DATE'].min()} to {df['DATE'].max()}")
        logging.info(f"Total rows: {len(df)}")
    else:
        logging.error("Failed to acquire NASA POWER dataset.")
        sys.exit(1)

if __name__ == "__main__":
    main()

