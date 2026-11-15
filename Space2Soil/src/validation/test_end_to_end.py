"""
Space2Soil: End-to-End System Validation & Test Suite
NASA Space Apps Challenge: Field Shift — Adapting Farms with NASA Data

Executes rigorous quality assurance checks across all 5 project phases:
1. Phase 2: Raw & Processed Data Integrity (POWER, GPM, SMAP, Landsat)
2. Phase 3: Agro-Meteorological Indicator & Crop Suitability Logic
3. Phase 4: Recommendation Engine & Multi-Criteria Decision Model
4. Phase 5: Web Application Payloads, GeoTIFF Overlays & Sensor Bounds
"""

import os
import sys
import json
import unittest
import pandas as pd
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SPACE2SOIL_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
DATA_DIR = os.path.join(SPACE2SOIL_DIR, 'data')
WEB_DIR = os.path.join(SPACE2SOIL_DIR, 'web')

class TestSpace2SoilSystem(unittest.TestCase):

    # ========================================================
    # PHASE 2: DATA INTEGRITY CHECKS
    # ========================================================
    def test_01_nasa_power_clean_data(self):
        daily_csv = os.path.join(DATA_DIR, 'processed', 'climate', 'nasa_power_ejura_daily_clean.csv')
        self.assertTrue(os.path.exists(daily_csv), "NASA POWER clean daily CSV missing.")
        df = pd.read_csv(daily_csv)
        self.assertEqual(len(df), 3653, "NASA POWER must contain 3,653 decadal daily records.")
        self.assertFalse(df['precipitation_mm_per_day'].isnull().any(), "Precipitation contains nulls.")
        self.assertFalse(df['temperature_mean_c'].isnull().any(), "Temperature mean contains nulls.")
        self.assertTrue((df['temperature_max_c'] >= df['temperature_min_c']).all(), "Max temp must >= min temp.")

    def test_02_gpm_imerg_data(self):
        gpm_csv = os.path.join(DATA_DIR, 'processed', 'rainfall', 'gpm_ejura_daily_clean.csv')
        self.assertTrue(os.path.exists(gpm_csv), "GPM clean daily CSV missing.")
        df = pd.read_csv(gpm_csv)
        self.assertEqual(len(df), 3653, "GPM must contain 3,653 decadal daily records.")
        total_precip = df['precipitation_mm'].sum()
        self.assertGreater(total_precip, 10000.0, "Decadal precipitation must be realistic (>10,000 mm).")
        self.assertLess(total_precip, 25000.0, "Decadal precipitation out of realistic bounds (<25,000 mm).")

    def test_03_smap_soil_moisture_data(self):
        smap_csv = os.path.join(DATA_DIR, 'processed', 'soil_moisture', 'smap_ejura_daily_clean.csv')
        self.assertTrue(os.path.exists(smap_csv), "SMAP clean daily CSV missing.")
        df = pd.read_csv(smap_csv)
        self.assertEqual(len(df), 3653, "SMAP must contain 3,653 decadal daily records.")
        self.assertTrue((df['surface_volumetric_moisture_m3_m3'] >= 0.0).all(), "Surface moisture negative.")
        self.assertTrue((df['surface_volumetric_moisture_m3_m3'] <= 0.60).all(), "Surface moisture exceeds saturation.")

    def test_04_landsat_rasters_and_timeseries(self):
        veg_dir = os.path.join(DATA_DIR, 'processed', 'vegetation')
        tifs = [
            'ejura_ndvi_dry_season_harmattan.tif',
            'ejura_ndvi_major_rainy_season_peak.tif',
            'ejura_ndvi_minor_rainy_season_peak.tif'
        ]
        for tif in tifs:
            path = os.path.join(veg_dir, tif)
            self.assertTrue(os.path.exists(path), f"Landsat raster {tif} missing.")
            self.assertGreater(os.path.getsize(path), 100000, f"Raster {tif} size invalid.")

    # ========================================================
    # PHASE 3: SCIENTIFIC ANALYSIS CHECKS
    # ========================================================
    def test_05_rainfall_seasonality_and_mfi(self):
        season_csv = os.path.join(DATA_DIR, 'processed', 'analysis', 'rainfall_seasonality_metrics.csv')
        mfi_csv = os.path.join(DATA_DIR, 'processed', 'analysis', 'rainfall_erosivity_index.csv')
        self.assertTrue(os.path.exists(season_csv), "Seasonality metrics CSV missing.")
        self.assertTrue(os.path.exists(mfi_csv), "MFI erosivity CSV missing.")
        
        df_season = pd.read_csv(season_csv)
        self.assertEqual(len(df_season), 10, "Seasonality metrics must cover 10 years.")
        mean_lgp = df_season['length_of_growing_period_days'].mean()
        self.assertGreater(mean_lgp, 180, "LGP should exceed 180 days in forest-savannah transition zone.")

        df_mfi = pd.read_csv(mfi_csv)
        mean_mfi = df_mfi['modified_fournier_index'].mean()
        self.assertGreater(mean_mfi, 120.0, "Ejura MFI must fall in high erosivity class (> 120).")

    def test_06_crop_suitability_matrix(self):
        suit_csv = os.path.join(DATA_DIR, 'processed', 'analysis', 'crop_suitability_matrix.csv')
        self.assertTrue(os.path.exists(suit_csv), "Crop suitability matrix missing.")
        df = pd.read_csv(suit_csv)
        crops = df['crop'].tolist()
        self.assertIn('Cassava', crops)
        self.assertIn('Cowpea', crops)
        self.assertIn('Maize', crops)
        self.assertTrue((df['mean_score'] >= 0.0).all())
        self.assertTrue((df['mean_score'] <= 100.0).all())

    # ========================================================
    # PHASE 4: RECOMMENDATION ENGINE CHECKS
    # ========================================================
    def test_07_rotation_scenarios_comparison(self):
        rec_csv = os.path.join(DATA_DIR, 'processed', 'recommendations', 'rotation_scenarios_comparison.csv')
        self.assertTrue(os.path.exists(rec_csv), "Rotation scenarios comparison CSV missing.")
        df = pd.read_csv(rec_csv)
        self.assertEqual(len(df), 3, "Must have exactly 3 scenarios (Scenario 1, Scenario 2, Baseline).")

        # Scenario 1 must rank 1
        s1 = df[df['scenario_key'] == 'Scenario_1'].iloc[0]
        self.assertEqual(int(s1['rank']), 1, "Scenario 1 must be ranked #1 overall.")
        self.assertGreater(float(s1['composite_score']), 90.0, "Scenario 1 composite score must exceed 90.")

        # Nitrogen balance check
        base = df[df['scenario_key'] == 'Baseline'].iloc[0]
        self.assertLess(float(base['net_soil_nitrogen_balance_kg_ha']), 0.0, "Baseline must deplete nitrogen.")
        self.assertGreater(float(s1['net_soil_nitrogen_balance_kg_ha']), 0.0, "Scenario 1 must fix positive net nitrogen.")

        # Profit check: Scenario 1 must significantly beat baseline
        self.assertGreater(float(s1['net_profit_ghs']), float(base['net_profit_ghs']) * 2.0, "Scenario 1 profit must double baseline.")

    def test_08_xai_farmer_cards(self):
        cards_path = os.path.join(DATA_DIR, 'processed', 'recommendations', 'farmer_recommendation_cards.json')
        self.assertTrue(os.path.exists(cards_path), "Farmer recommendation cards JSON missing.")
        with open(cards_path, 'r') as f:
            cards = json.load(f)
        self.assertEqual(len(cards), 3, "Must have 3 farmer cards.")
        s1_card = [c for c in cards if c['scenario_id'] == 'SCENARIO_1_CLIMATE_RESILIENCE'][0]
        self.assertIn('nasa_decision_triggers', s1_card)
        self.assertIn('planting_trigger', s1_card['nasa_decision_triggers'])

    # ========================================================
    # PHASE 5: WEB APPLICATION ASSETS & CONSISTENCY CHECKS
    # ========================================================
    def test_09_web_assets(self):
        assets = [
            'ndvi_dry_harmattan.png',
            'ndvi_major_peak.png',
            'ndvi_minor_peak.png',
            'farm_boundary.geojson',
            'sensor_bounds.json',
            'space2soil_full_data.json'
        ]
        for asset in assets:
            path = os.path.join(WEB_DIR, 'assets', asset)
            self.assertTrue(os.path.exists(path), f"Web asset {asset} missing.")

    def test_10_app_entrypoint_and_html(self):
        html_path = os.path.join(WEB_DIR, 'index.html')
        js_path = os.path.join(WEB_DIR, 'app.js')
        css_path = os.path.join(WEB_DIR, 'styles.css')
        app_py_path = os.path.join(SPACE2SOIL_DIR, 'app.py')

        self.assertTrue(os.path.exists(html_path), "index.html missing.")
        self.assertTrue(os.path.exists(js_path), "app.js missing.")
        self.assertTrue(os.path.exists(css_path), "styles.css missing.")
        self.assertTrue(os.path.exists(app_py_path), "app.py missing.")

    # ========================================================
    # PHASE 5+: SOILGRIDS, ECOSTRESS & WHAT-IF SIMULATOR
    # ========================================================
    def test_11_soilgrids_data(self):
        profile_csv = os.path.join(DATA_DIR, 'processed', 'soil_properties', 'soilgrids_ejura_profile.csv')
        meta_json = os.path.join(DATA_DIR, 'metadata', 'soilgrids_validation_report.json')
        self.assertTrue(os.path.exists(profile_csv), "SoilGrids profile CSV missing.")
        self.assertTrue(os.path.exists(meta_json), "SoilGrids metadata JSON missing.")
        df = pd.read_csv(profile_csv)
        self.assertEqual(len(df), 40, "SoilGrids should contain 40 rows (8 properties x 5 depths).")
        self.assertFalse(df['mean_value'].isnull().any(), "SoilGrids contains null values.")
        with open(meta_json, 'r') as f:
            meta = json.load(f)
        self.assertEqual(meta['completeness_pct'], 100.0, "SoilGrids completeness must be 100%.")

    def test_12_ecostress_evapotranspiration(self):
        daily_csv = os.path.join(DATA_DIR, 'processed', 'evapotranspiration', 'ecostress_ejura_et_daily.csv')
        seasonal_csv = os.path.join(DATA_DIR, 'processed', 'evapotranspiration', 'ecostress_ejura_seasonal_summary.csv')
        self.assertTrue(os.path.exists(daily_csv), "ECOSTRESS daily ET CSV missing.")
        self.assertTrue(os.path.exists(seasonal_csv), "ECOSTRESS seasonal summary CSV missing.")
        df = pd.read_csv(daily_csv)
        self.assertEqual(len(df), 3653, "ECOSTRESS daily ET should cover 3,653 days.")
        self.assertGreater(df['et_mm_day'].mean(), 1.5, "Daily ET should be realistic (> 1.5 mm/day).")

    def test_13_whatif_simulator(self):
        html_path = os.path.join(WEB_DIR, 'index.html')
        js_path = os.path.join(WEB_DIR, 'app.js')
        with open(html_path, 'r', encoding='utf-8') as f:
            html = f.read()
        with open(js_path, 'r', encoding='utf-8') as f:
            js = f.read()
        self.assertIn('view-whatif', html, "What-If simulator tab view missing in index.html.")
        self.assertIn('runWhatIfSimulation', js, "runWhatIfSimulation function missing in app.js.")

def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestSpace2SoilSystem)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
