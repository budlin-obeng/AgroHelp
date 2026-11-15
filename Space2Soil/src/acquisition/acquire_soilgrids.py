"""
SoilGrids v2.0 Data Acquisition Script
Fetches soil physical property data for Ejura, Ghana from ISRIC SoilGrids REST API.
Coordinates: Lat 7.3856, Lon -1.3562
"""

import requests
import json
import csv
import os
import datetime

# ── Configuration ──────────────────────────────────────────────────────────────
# Agricultural Farm Parcel of Ejura (outside town center settlement non-soil mask)
LAT = 7.3956
LON = -1.3462
LOCATION = "Ejura Agricultural Farm Parcel, Ashanti Region, Ghana"

PROPERTIES = ["phh2o", "clay", "sand", "silt", "soc", "bdod", "cec", "nitrogen"]
DEPTHS = ["0-5cm", "5-15cm", "15-30cm", "30-60cm", "60-100cm"]
VALUES = ["mean", "uncertainty"]

BASE_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"

# File paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_JSON  = os.path.join(BASE_DIR, "data", "raw", "soilgrids", "soilgrids_ejura_raw.json")
PROFILE_CSV = os.path.join(BASE_DIR, "data", "processed", "soil_properties", "soilgrids_ejura_profile.csv")
METADATA_JSON = os.path.join(BASE_DIR, "data", "metadata", "soilgrids_validation_report.json")
WEB_DATA_JSON = os.path.join(BASE_DIR, "web", "assets", "space2soil_full_data.json")
LOG_FILE = os.path.join(BASE_DIR, "logs", "acquisition_soilgrids.log")

# Unit info per property
PROPERTY_META = {
    "phh2o":    {"unit": "pH",          "description": "Soil pH in water (H2O)",              "conversion": lambda v: round(v / 10, 2)  if v is not None else None},
    "clay":     {"unit": "g/kg",        "description": "Clay content",                         "conversion": lambda v: round(v / 10, 1)  if v is not None else None},
    "sand":     {"unit": "g/kg",        "description": "Sand content",                         "conversion": lambda v: round(v / 10, 1)  if v is not None else None},
    "silt":     {"unit": "g/kg",        "description": "Silt content",                         "conversion": lambda v: round(v / 10, 1)  if v is not None else None},
    "soc":      {"unit": "g/kg",        "description": "Soil Organic Carbon",                  "conversion": lambda v: round(v / 10, 2)  if v is not None else None},
    "bdod":     {"unit": "g/cm3",       "description": "Bulk Density of fine earth",           "conversion": lambda v: round(v / 100, 3) if v is not None else None},
    "cec":      {"unit": "mmol(c)/kg",  "description": "Cation Exchange Capacity (clay)",      "conversion": lambda v: round(v / 10, 1)  if v is not None else None},
    "nitrogen": {"unit": "cg/kg",       "description": "Total nitrogen (Kjeldahl)",             "conversion": lambda v: round(v / 100, 3) if v is not None else None},
}

os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

def log(msg):
    ts = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def build_url():
    params = []
    params.append(f"lon={LON}")
    params.append(f"lat={LAT}")
    for p in PROPERTIES:
        params.append(f"property={p}")
    for d in DEPTHS:
        params.append(f"depth={d}")
    for v in VALUES:
        params.append(f"value={v}")
    return BASE_URL + "?" + "&".join(params)


def fetch_soilgrids():
    params = {
        'lon': LON,
        'lat': LAT,
        'property': PROPERTIES,
        'depth': DEPTHS,
        'value': VALUES
    }
    log(f"Fetching from ISRIC SoilGrids REST API for ({LAT}, {LON})...")
    resp = requests.get(BASE_URL, params=params, timeout=60, headers={"Accept": "application/json", "User-Agent": "Space2Soil/1.0"})
    resp.raise_for_status()
    data = resp.json()
    log("API call succeeded with 200 OK.")
    return data


def parse_profile(raw):
    rows = []
    layers = raw.get("properties", {}).get("layers", [])
    for layer in layers:
        prop = layer.get("name", "")
        depths_data = layer.get("depths", [])
        for depth_entry in depths_data:
            depth_label = depth_entry.get("label", "")
            depth_range = depth_entry.get("range", {})
            depth_top = depth_range.get("top_depth", None)
            depth_bottom = depth_range.get("bottom_depth", None)
            depth_cm = f"{depth_top}-{depth_bottom}" if (depth_top is not None and depth_bottom is not None) else depth_label
            values = depth_entry.get("values", {})
            raw_mean = values.get("mean", None)
            raw_unc  = values.get("uncertainty", None)
            meta = PROPERTY_META.get(prop, {"unit": "raw", "description": prop, "conversion": lambda v: v})
            conv = meta["conversion"]
            mean_val = conv(raw_mean)
            unc_val  = conv(raw_unc)
            rows.append({
                "property": prop,
                "depth_cm": depth_cm,
                "mean_value": mean_val,
                "uncertainty": unc_val,
                "unit": meta["unit"],
                "description": meta["description"],
            })
    return rows


def classify_texture(clay_pct, sand_pct, silt_pct):
    # USDA texture triangle (approximate)
    if clay_pct >= 40:
        return "Clay"
    elif clay_pct >= 27 and sand_pct <= 20:
        return "Clay"
    elif clay_pct >= 27:
        return "Sandy Clay" if sand_pct >= 45 else "Clay Loam"
    elif sand_pct >= 70 and clay_pct < 15:
        return "Sandy Loam" if clay_pct >= 7 else "Loamy Sand" if clay_pct >= 3 else "Sand"
    elif silt_pct >= 50:
        return "Silty Clay Loam" if clay_pct >= 27 else "Silt Loam"
    else:
        return "Loam"


def classify_ph(ph):
    if ph < 4.5:   return "Extremely acid"
    elif ph < 5.0: return "Very strongly acid"
    elif ph < 5.5: return "Strongly acid"
    elif ph < 6.0: return "Moderately acid"
    elif ph < 6.5: return "Slightly acid"
    elif ph < 7.0: return "Neutral"
    elif ph < 7.5: return "Slightly alkaline"
    elif ph < 8.0: return "Moderately alkaline"
    else:          return "Strongly alkaline"


def classify_soc(soc_g_per_kg):
    if soc_g_per_kg < 5:   return "Very low"
    elif soc_g_per_kg < 10: return "Low"
    elif soc_g_per_kg < 20: return "Medium"
    elif soc_g_per_kg < 30: return "High"
    else:                   return "Very high"


def main():
    log("=== SoilGrids Acquisition Start ===")

    # 1. Fetch
    raw = fetch_soilgrids()

    # 2. Save raw JSON
    os.makedirs(os.path.dirname(RAW_JSON), exist_ok=True)
    with open(RAW_JSON, "w", encoding="utf-8") as f:
        json.dump(raw, f, indent=2)
    log(f"Raw JSON saved: {RAW_JSON}")

    # 3. Parse profile
    rows = parse_profile(raw)
    log(f"Parsed {len(rows)} data rows from {len(PROPERTIES)} properties × {len(DEPTHS)} depths")

    # 4. Save CSV
    os.makedirs(os.path.dirname(PROFILE_CSV), exist_ok=True)
    fieldnames = ["property", "depth_cm", "mean_value", "uncertainty", "unit", "description"]
    with open(PROFILE_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    log(f"CSV profile saved: {PROFILE_CSV}")

    # 5. Agronomic classification at 0-5cm
    def get_val(prop, depth="0-5"):
        for r in rows:
            if r["property"] == prop and r["depth_cm"].startswith(depth):
                return r["mean_value"]
        return None

    clay_05  = get_val("clay")   # g/kg
    sand_05  = get_val("sand")   # g/kg
    silt_05  = get_val("silt")   # g/kg
    ph_05    = get_val("phh2o")  # pH
    soc_05   = get_val("soc")    # g/kg

    # Convert g/kg → percent for texture triangle
    clay_pct = (clay_05 / 10) if clay_05 else None
    sand_pct = (sand_05 / 10) if sand_05 else None
    silt_pct = (silt_05 / 10) if silt_05 else None

    texture_class = classify_texture(clay_pct, sand_pct, silt_pct) if all(v is not None for v in [clay_pct, sand_pct, silt_pct]) else "Unknown"
    ph_class      = classify_ph(ph_05) if ph_05 is not None else "Unknown"
    soc_class     = classify_soc(soc_05) if soc_05 is not None else "Unknown"

    log(f"Texture class (0-5cm): {texture_class}")
    log(f"pH at 0-5cm: {ph_05} → {ph_class}")
    log(f"SOC at 0-5cm: {soc_05} g/kg → {soc_class}")

    # 6. Metadata / validation report
    raw_size = os.path.getsize(RAW_JSON)
    csv_size = os.path.getsize(PROFILE_CSV)
    total_expected = len(PROPERTIES) * len(DEPTHS)
    non_null = sum(1 for r in rows if r["mean_value"] is not None)
    completeness_pct = round(100 * non_null / total_expected, 1) if total_expected else 0

    metadata = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "source": "ISRIC SoilGrids v2.0 REST API",
        "location": LOCATION,
        "coordinates": {"lat": LAT, "lon": LON},
        "properties_fetched": PROPERTIES,
        "depths_fetched": DEPTHS,
        "total_data_points": len(rows),
        "non_null_points": non_null,
        "completeness_pct": completeness_pct,
        "file_sizes": {
            "raw_json_bytes": raw_size,
            "profile_csv_bytes": csv_size,
        },
        "agronomic_findings": {
            "texture_class": texture_class,
            "clay_g_per_kg_0_5cm": clay_05,
            "sand_g_per_kg_0_5cm": sand_05,
            "silt_g_per_kg_0_5cm": silt_05,
            "pH_at_0_5cm": ph_05,
            "pH_class": ph_class,
            "SOC_g_per_kg_0_5cm": soc_05,
            "SOC_class": soc_class,
        },
        "files": {
            "raw_json": RAW_JSON,
            "profile_csv": PROFILE_CSV,
            "metadata_json": METADATA_JSON,
        },
    }

    os.makedirs(os.path.dirname(METADATA_JSON), exist_ok=True)
    with open(METADATA_JSON, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    log(f"Metadata saved: {METADATA_JSON}")

    # 7. Update web payload
    with open(WEB_DATA_JSON, "r", encoding="utf-8") as f:
        web_data = json.load(f)

    web_data["soilgrid_profile"] = rows

    with open(WEB_DATA_JSON, "w", encoding="utf-8") as f:
        json.dump(web_data, f, indent=2)
    log(f"Web payload updated: {WEB_DATA_JSON}")

    log("=== SoilGrids Acquisition Complete ===")

    # Print summary for board report
    print("\n--- SUMMARY ---")
    print(f"Texture class: {texture_class}")
    print(f"pH at 0-5cm:   {ph_05} ({ph_class})")
    print(f"SOC at 0-5cm:  {soc_05} g/kg ({soc_class})")
    print(f"Completeness:  {completeness_pct}% ({non_null}/{total_expected})")


if __name__ == "__main__":
    main()
