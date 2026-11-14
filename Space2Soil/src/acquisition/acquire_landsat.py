"""
Landsat 8 & 9 Collection 2 Level-2 Surface Reflectance Acquisition for Space2Soil
Target Location: Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)
Historical Period: 2016-01-01 to 2025-12-31
Archive: USGS Landsat Collection 2 Level-2 via Microsoft Planetary Computer STAC
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
log_file = os.path.join(LOG_DIR, "acquisition_landsat.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

STAC_SEARCH_URL = "https://planetarycomputer.microsoft.com/api/stac/v1/search"
SAS_SIGN_URL = "https://planetarycomputer.microsoft.com/api/sas/v1/sign"

TARGET_CONFIG = {
    "location_name": "Ejura, Ashanti Region, Ghana",
    "latitude": 7.3856,
    "longitude": -1.3562,
    "start_date": "2016-01-01T00:00:00Z",
    "end_date": "2025-12-31T23:59:59Z",
    "collection": "landsat-c2-l2",
    "cloud_cover_max": 100.0  # Retrieve full decadal scene catalog
}

def search_landsat_scenes(config):
    """
    Queries Planetary Computer STAC for all Landsat 8 and 9 scenes
    intersecting the Ejura pilot agricultural coordinates.
    """
    logging.info(f"Querying STAC catalog for Landsat Collection 2 Level-2 at {config['location_name']}")
    logging.info(f"Temporal window: {config['start_date']} to {config['end_date']}")
    
    payload = {
        "collections": [config["collection"]],
        "intersects": {
            "type": "Point",
            "coordinates": [config["longitude"], config["latitude"]]
        },
        "datetime": f"{config['start_date']}/{config['end_date']}",
        "limit": 250
    }
    
    all_features = []
    page = 1
    
    while True:
        logging.info(f"Fetching STAC page {page}...")
        resp = requests.post(STAC_SEARCH_URL, json=payload, timeout=60)
        if resp.status_code != 200:
            logging.error(f"STAC search request failed: {resp.status_code} - {resp.text}")
            break
            
        data = resp.json()
        features = data.get("features", [])
        all_features.extend(features)
        logging.info(f"Page {page}: Retrieved {len(features)} features (Total so far: {len(all_features)})")
        
        # Check for next link
        next_link = None
        for link in data.get("links", []):
            if link.get("rel") == "next":
                next_link = link
                break
                
        if not next_link:
            break
            
        # Prepare payload or URL for next page
        if "body" in next_link:
            payload = next_link["body"]
        elif "href" in next_link:
            # Token/href pagination
            resp = requests.get(next_link["href"], timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                features = data.get("features", [])
                all_features.extend(features)
                logging.info(f"Page {page+1}: Retrieved {len(features)} features (Total: {len(all_features)})")
            break
        else:
            break
        page += 1

    logging.info(f"Total Landsat scenes found over Ejura: {len(all_features)}")
    return all_features

def parse_and_save_scene_catalog(features, base_dir):
    """
    Parses STAC features into structured metadata and scene inventory CSV.
    """
    raw_dir = os.path.join(base_dir, "data", "raw", "landsat")
    meta_dir = os.path.join(base_dir, "data", "metadata")
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(meta_dir, exist_ok=True)

    records = []
    for feat in features:
        props = feat.get("properties", {})
        assets = feat.get("assets", {})
        scene_id = feat.get("id")
        dt_str = props.get("datetime")
        
        # Extract band asset URLs
        red_url = assets.get("red", {}).get("href")
        nir_url = assets.get("nir08", {}).get("href")
        blue_url = assets.get("blue", {}).get("href")
        qa_url = assets.get("qa_pixel", {}).get("href")
        
        records.append({
            "scene_id": scene_id,
            "datetime": dt_str,
            "date": dt_str[:10] if dt_str else None,
            "platform": props.get("platform"),
            "instruments": ",".join(props.get("instruments", [])),
            "cloud_cover_pct": props.get("eo:cloud_cover"),
            "landsat_wrs_path": props.get("landsat:wrs_path"),
            "landsat_wrs_row": props.get("landsat:wrs_row"),
            "sun_elevation": props.get("view:sun_elevation"),
            "sun_azimuth": props.get("view:sun_azimuth"),
            "red_asset_href": red_url,
            "nir_asset_href": nir_url,
            "blue_asset_href": blue_url,
            "qa_pixel_asset_href": qa_url
        })
        
    df = pd.DataFrame(records)
    if len(df) > 0:
        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df.sort_values("datetime").reset_index(drop=True)
        
    csv_path = os.path.join(raw_dir, "landsat_ejura_scene_catalog.csv")
    df.to_csv(csv_path, index=False)
    logging.info(f"Saved complete scene inventory to {csv_path} ({len(df)} scenes)")

    # Save raw STAC JSON catalog
    json_path = os.path.join(raw_dir, "landsat_ejura_scene_catalog.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(features, f, indent=2)
    logging.info(f"Saved raw STAC JSON features to {json_path}")

    # Generate metadata summary
    clear_scenes = df[df["cloud_cover_pct"] <= 20.0] if len(df) > 0 else df
    metadata = {
        "dataset_name": "USGS Landsat Collection 2 Level-2 Surface Reflectance",
        "archive_source": "USGS / Microsoft Planetary Computer STAC",
        "spatial_resolution": "30 meters",
        "target_location": TARGET_CONFIG["location_name"],
        "target_coordinates": {
            "latitude": TARGET_CONFIG["latitude"],
            "longitude": TARGET_CONFIG["longitude"]
        },
        "landsat_wrs_path_row": "Path 194 / Row 54",
        "temporal_range": f"{df['date'].min() if len(df) > 0 else 'N/A'} to {df['date'].max() if len(df) > 0 else 'N/A'}",
        "total_scenes_acquired": len(df),
        "clear_scenes_under_20pct_cloud": len(clear_scenes),
        "platforms_represented": list(df["platform"].unique()) if len(df) > 0 else [],
        "bands_tracked": {
            "red": "Band 4 (0.64 - 0.67 um) 30m Surface Reflectance",
            "nir08": "Band 5 (0.85 - 0.88 um) 30m Surface Reflectance",
            "blue": "Band 2 (0.45 - 0.51 um) 30m Surface Reflectance",
            "qa_pixel": "Surface Reflectance Quality Assessment (16-bit bitmask)"
        },
        "cloud_masking_standard": "USGS QA_PIXEL Bitmask (Bit 0: Fill, Bit 1: Dilated Cloud, Bit 2: Cirrus, Bit 3: Cloud, Bit 4: Cloud Shadow)",
        "retrieval_timestamp": datetime.utcnow().isoformat() + "Z"
    }

    meta_path = os.path.join(meta_dir, "landsat_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logging.info(f"Saved Landsat metadata summary to {meta_path}")

    return csv_path, meta_path, df

def sign_asset_url(href):
    """
    Signs asset URL using Planetary Computer SAS signing API
    """
    try:
        resp = requests.get(SAS_SIGN_URL, params={"href": href}, timeout=30)
        if resp.status_code == 200:
            return resp.json().get("href")
    except Exception as e:
        logging.warning(f"Failed to sign URL: {e}")
    return href

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    logging.info("Starting Landsat STAC scene acquisition...")
    features = search_landsat_scenes(TARGET_CONFIG)
    if features:
        csv_path, meta_path, df = parse_and_save_scene_catalog(features, base_dir)
        logging.info("Landsat catalog acquisition successful.")
        logging.info(f"Total scenes cataloged: {len(df)}")
        if len(df) > 0:
            logging.info(f"Cloud cover stats: Min {df['cloud_cover_pct'].min()}%, Median {df['cloud_cover_pct'].median()}%, Max {df['cloud_cover_pct'].max()}%")
    else:
        logging.error("No Landsat features retrieved.")
        sys.exit(1)

if __name__ == "__main__":
    main()

