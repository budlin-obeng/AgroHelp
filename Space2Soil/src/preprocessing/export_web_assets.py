"""
Space2Soil: Export Web Assets and PNG Overlays
Generates color-mapped PNG overlays from Landsat 30m GeoTIFFs
and bundles analytical JSON datasets for the web application.
"""

import os
import json
import numpy as np
import tifffile
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.cm as cm

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SPACE2SOIL_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
DATA_DIR = os.path.join(SPACE2SOIL_DIR, 'data')
WEB_DIR = os.path.join(SPACE2SOIL_DIR, 'web')
ASSETS_DIR = os.path.join(WEB_DIR, 'assets')

os.makedirs(ASSETS_DIR, exist_ok=True)

def export_geotiff_overlays():
    veg_dir = os.path.join(DATA_DIR, 'processed', 'vegetation')
    tifs = {
        'ndvi_dry_harmattan.png': 'ejura_ndvi_dry_season_harmattan.tif',
        'ndvi_major_peak.png': 'ejura_ndvi_major_rainy_season_peak.tif',
        'ndvi_minor_peak.png': 'ejura_ndvi_minor_rainy_season_peak.tif'
    }
    
    colormap = matplotlib.colormaps['RdYlGn']
    
    for png_name, tif_name in tifs.items():
        tif_path = os.path.join(veg_dir, tif_name)
        if not os.path.exists(tif_path):
            print(f"Warning: {tif_path} not found.")
            continue
            
        data = tifffile.imread(tif_path)
        # Normalize between 0.0 and 1.0 for NDVI
        norm_data = np.clip(data, 0.0, 1.0)
        rgba = colormap(norm_data)
        # Set alpha channel to 0.85 for map translucency
        rgba[:, :, 3] = 0.85
        
        out_path = os.path.join(ASSETS_DIR, png_name)
        plt.imsave(out_path, rgba)
        print(f"Exported overlay: {out_path} ({data.shape[1]}x{data.shape[0]})")

def export_geojson_boundaries():
    # Center: 7.3856 N, -1.3562 W
    # Farm parcel (~25 hectares) and district context
    lat, lon = 7.3856, -1.3562
    
    # 25-hectare pilot farm boundary coordinates (500m x 500m polygon)
    dlat = 0.00225
    dlon = 0.00225
    farm_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Ejura Pilot Demonstration Farm",
                    "owner": "Space2Soil Research & Demonstration Hub",
                    "area_ha": 25.0,
                    "soil_type": "Chromic Luvisol / Sandy Loam",
                    "district": "Ejura-Sekyedumase",
                    "current_rotation": "Scenario 1: Maize + Cassava -> Cowpea"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [lon - dlon, lat - dlat],
                        [lon + dlon, lat - dlat],
                        [lon + dlon, lat + dlat],
                        [lon - dlon, lat + dlat],
                        [lon - dlon, lat - dlat]
                    ]]
                }
            }
        ]
    }
    
    # Raster overlay bounding box (7.5 km x 7.5 km)
    bounds = {
        "center": [lat, lon],
        "bounds": [
            [lat - 0.03375, lon - 0.03405],
            [lat + 0.03375, lon + 0.03405]
        ],
        "power_grid": {
            "resolution_km": 50,
            "bounds": [
                [lat - 0.25, lon - 0.3125],
                [lat + 0.25, lon + 0.3125]
            ]
        },
        "smap_grid": {
            "resolution_km": 9,
            "bounds": [
                [lat - 0.0405, lon - 0.0408],
                [lat + 0.0405, lon + 0.0408]
            ]
        },
        "gpm_grid": {
            "resolution_km": 10,
            "bounds": [
                [lat - 0.045, lon - 0.045],
                [lat + 0.045, lon + 0.045]
            ]
        }
    }
    
    with open(os.path.join(ASSETS_DIR, 'farm_boundary.geojson'), 'w') as f:
        json.dump(farm_geojson, f, indent=2)
        
    with open(os.path.join(ASSETS_DIR, 'sensor_bounds.json'), 'w') as f:
        json.dump(bounds, f, indent=2)
        
    print("Exported GeoJSON and Sensor spatial bounds.")

def export_consolidated_payload():
    # Consolidate analysis and recommendation JSON for client-side zero-lag rendering
    rec_cards_path = os.path.join(DATA_DIR, 'processed', 'recommendations', 'farmer_recommendation_cards.json')
    rec_scores_path = os.path.join(DATA_DIR, 'processed', 'recommendations', 'scenario_detailed_scores.json')
    
    with open(rec_cards_path, 'r') as f:
        cards = json.load(f)
    with open(rec_scores_path, 'r') as f:
        scores = json.load(f)
        
    payload = {
        "metadata": {
            "project": "Space2Soil",
            "challenge": "NASA Space Apps Challenge - Field Shift: Adapting Farms with NASA Data",
            "target": "Ejura, Ashanti Region, Ghana",
            "coordinates": {"lat": 7.3856, "lon": -1.3562},
            "baseline_period": "2016-2025 (10-Year Decadal Record, 3653 days)"
        },
        "recommendation_cards": cards,
        "scenario_scores": scores,
        "climatology_summary": {
            "annual_rainfall_mm": 1408.86,
            "wet_days_per_year": 215.9,
            "dry_spells_per_season": 3.2,
            "mean_annual_temp_c": 26.83,
            "heat_stress_days_per_year": 34.0,
            "warming_rate_c_decade": 0.21,
            "mean_surface_moisture_m3m3": 0.257,
            "mean_rootzone_moisture_m3m3": 0.254,
            "drought_days_per_year": 55.7,
            "peak_ndvi_major": 0.74,
            "min_ndvi_harmattan": 0.28
        }
    }
    
    with open(os.path.join(ASSETS_DIR, 'space2soil_full_data.json'), 'w') as f:
        json.dump(payload, f, indent=2)
        
    print("Exported consolidated web payload space2soil_full_data.json.")

if __name__ == '__main__':
    export_geotiff_overlays()
    export_geojson_boundaries()
    export_consolidated_payload()
    print("Web assets export completed successfully.")
