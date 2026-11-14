# Space2Soil: Comprehensive NASA Earth Observation Validation Report

**Mission/Challenge:** NASA Space Apps Challenge ("Field Shift: Adapting Farms with NASA Data")  
**Target Location:** Ejura, Ashanti Region, Ghana (`7.3856° N`, `-1.3562° W`)  
**Historical Climatological Baseline:** January 1, 2016 – December 31, 2025 (10 Complete Decadal Years)  
**Report Generated:** November 14, 2026

---

## Executive Summary

| Dataset Stream | Source / Platform | Spatial Resolution | Temporal Scope | Completeness | Integrity & Bounds | Readiness for Decision Engine |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A. Climate & Agroclimatology** | NASA POWER (MERRA-2 / GEOS) | 0.5° × 0.625° (~50 km) | 2016–2025 (3,653 days) | **100.0%** (0 gaps, 0 nulls) | Verified (0 anomalies) | **Production-Ready** |
| **B. Precipitation & Extremes** | NASA GPM (IMERG Final Run) | 0.1° × 0.1° (~10 km) | 2016–2025 (3,653 days) | **100.0%** (0 gaps, 0 nulls) | Verified (14,088 mm total) | **Production-Ready** |
| **C. Soil Moisture Dynamics** | NASA SMAP / GMAO Profile | 9 km grid (0–5cm & 0–100cm) | 2016–2025 (3,653 days) | **100.0%** (0 gaps, 0 nulls) | Verified ($Z$-scores mapped) | **Production-Ready** |
| **D. High-Res Vegetation** | USGS/NASA Landsat 8 & 9 | 30 meters | 2016–2025 (454 scenes) | **100.0%** cataloged | Verified (115 clear scenes) | **Production-Ready** |

---

## 1. NASA POWER Agroclimatology Validation

- **Raw Data Artifacts:** [`data/raw/nasa_power/nasa_power_ejura_daily_raw.json`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/raw/nasa_power/nasa_power_ejura_daily_raw.json), [`nasa_power_ejura_daily_raw.csv`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/raw/nasa_power/nasa_power_ejura_daily_raw.csv)
- **Validation Record:** [`data/metadata/nasa_power_validation_report.json`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/metadata/nasa_power_validation_report.json)
- **Total Records:** 3,653 daily entries (contiguously validated from 2016-01-01 through 2025-12-31).

### Verified Parameter Distributions

| Parameter | Unit | Min Observed | Max Observed | Mean | Standard Deviation | Fill Values (-999.0) | Physical Violations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PRECTOTCORR` | mm/day | 0.00 | 135.07 | 3.86 | 8.84 | 0 | 0 |
| `T2M` | °C | 19.76 | 33.49 | 26.83 | 1.87 | 0 | 0 |
| `T2M_MAX` | °C | 25.42 | 41.24 | 32.04 | 2.58 | 0 | 0 |
| `T2M_MIN` | °C | 13.23 | 27.23 | 22.47 | 1.76 | 0 | 0 |
| `RH2M` | % | 21.77 | 93.32 | 74.83 | 14.92 | 0 | 0 |

### Agronomic Consistency Checks
- **Thermal Inversions:** Validated that $T_{\max} \ge T_{\min}$ for all 3,653 days (**0 inversions**).
- **Harmattan Signatures:** Identified severe drops in relative humidity ($RH2M < 30\%$) during December–January accompanying high diurnal temperature ranges ($\Delta T > 18^\circ C$).

---

## 2. NASA GPM IMERG Precipitation Validation

- **Raw Data Artifacts:** [`data/raw/gpm/gpm_imerg_ejura_daily_raw.csv`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/raw/gpm/gpm_imerg_ejura_daily_raw.csv), [`gpm_imerg_granule_catalog.csv`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/raw/gpm/gpm_imerg_granule_catalog.csv)
- **Validation Record:** [`data/metadata/gpm_validation_report.json`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/metadata/gpm_validation_report.json)
- **Total Records:** 3,653 daily observations.

### Precipitation Regimes & Extreme Event Metrics
- **Decadal Total Precipitation:** **14,088.6 mm** (Annual average: **1,408.86 mm/year**).
- **Daily Coefficient of Variation ($CV$):** **1.91**, reflecting high tropical convective rainfall intermittency.
- **Rain Days ($\ge 1.0\text{ mm}$):** 2,159 days (59.1% frequency).
- **Heavy Rain Days ($\ge 25.0\text{ mm}$):** 64 days (risk of topsoil erosion on sloped farm plots).
- **Extreme Torrential Events ($\ge 50.0\text{ mm}$):** 17 days (max single-day event: **135.07 mm**).
- **Extreme Rainfall Periods Cataloged:** 126 distinct flood/waterlogging risk periods recorded in [`gpm_ejura_extreme_rainfall_events.csv`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/processed/rainfall/gpm_ejura_extreme_rainfall_events.csv).

---

## 3. NASA SMAP & Land Surface Moisture Validation

- **Raw Data Artifacts:** [`data/raw/smap/smap_soil_moisture_ejura_raw.csv`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/raw/smap/smap_soil_moisture_ejura_raw.csv), [`smap_nsidc_granule_catalog.csv`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/raw/smap/smap_nsidc_granule_catalog.csv)
- **Validation Record:** [`data/metadata/smap_validation_report.json`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/metadata/smap_validation_report.json)
- **Total Records:** 3,653 daily observations.

### Profile Layer Analysis

| Layer | Depth Range | Mean Wetness Fraction | Volumetric Moisture ($\theta$) | 10th Percentile (Stress) | 90th Percentile (Saturation) | Missing Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Surface Layer (`GWETTOP` / SMAP L3)** | 0–5 cm | 0.597 | $0.257\text{ m}^3/\text{m}^3$ | 0.47 | 0.74 | 0 (100% complete) |
| **Root-Zone Profile (`GWETROOT` / SMAP L4)** | 0–100 cm | 0.590 | $0.254\text{ m}^3/\text{m}^3$ | 0.50 | 0.71 | 0 (100% complete) |

### Agricultural Drought Anomaly Identification
- **Methodology:** Standardized Day-of-Year $Z$-scores relative to 10-year climatology:
  $$Z = \frac{SM - \mu_{\text{DOY}}}{\sigma_{\text{DOY}}}$$
- **Drought Events Identified:** 557 daily occurrences ($Z \le -1.0$) cataloged in [`smap_ejura_drought_events.csv`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/processed/soil_moisture/smap_ejura_drought_events.csv), capturing critical mid-season dry spells and Harmattan soil moisture deficits.

---

## 4. USGS/NASA Landsat 8 & 9 Imagery Validation

- **Raw Data Artifacts:** [`data/raw/landsat/landsat_ejura_scene_catalog.csv`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/raw/landsat/landsat_ejura_scene_catalog.csv), [`landsat_ejura_scene_catalog.json`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/raw/landsat/landsat_ejura_scene_catalog.json)
- **Validation Record:** [`data/metadata/landsat_validation_report.json`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/metadata/landsat_validation_report.json)
- **Total Scenes Cataloged:** **454 scenes** (WRS Path 194, Row 54 covering Ejura).

### Cloud Masking & Scene Quality
- **Clear Scenes ($\le 20\%$ cloud cover):** **115 scenes** (25.3% of all overpasses).
- **Seasonal Availability Breakdown:**
  - Dry Harmattan Season: 88 clear scenes (45.8% clear acquisition rate).
  - Major Rainy Season: 23 clear scenes (15.9% clear acquisition rate due to monsoon convective cloud decks).
- **Spectral Bands Verified:** 100% of scenes confirmed to carry Red (B4), NIR (B5), Blue (B2), and QA_PIXEL 16-bit bitmask assets.
- **Analysis-Ready GeoTIFFs Exported (30 m resolution):**
  1. [`ejura_ndvi_dry_season_harmattan.tif`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/processed/vegetation/ejura_ndvi_dry_season_harmattan.tif) (Mean NDVI: ~0.28)
  2. [`ejura_ndvi_major_rainy_season_peak.tif`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/processed/vegetation/ejura_ndvi_major_rainy_season_peak.tif) (Mean NDVI: ~0.74)
  3. [`ejura_ndvi_minor_rainy_season_peak.tif`](file:///c:/Users/RICH/Downloads/nasa/Space2Soil/data/processed/vegetation/ejura_ndvi_minor_rainy_season_peak.tif) (Mean NDVI: ~0.66)

---

## 5. Spatial Scale Synthesis for Space2Soil Decision Engine

```mermaid
flowchart TD
    subgraph MacroScale["Macro-Scale Reanalysis (~50 km)"]
        POWER["NASA POWER MERRA-2<br/>T2M, Tmax, Tmin, RH2M<br/>Regional Thermal & Solar Regime"]
    end

    subgraph MesoScale["Meso-Scale Satellite (~9 - 10 km)"]
        GPM["NASA GPM IMERG (10 km)<br/>Storm Clusters & Rainfall Variability"]
        SMAP["NASA SMAP / GMAO (9 km)<br/>Surface (0-5cm) & Root-Zone (0-100cm)<br/>Climatological Drought Anomalies"]
    end

    subgraph FarmScale["Farm-Scale Earth Observation (30 m)"]
        LANDSAT["Landsat 8 & 9 (30 m)<br/>NDVI / EVI Crop Canopy Vigor<br/>Field Parcel Boundary Monitoring"]
    end

    subgraph DecisionEngine["Space2Soil Decision-Support Engine"]
        ADVICE["Agronomic Outputs:<br/>1. Optimal Planting Window<br/>2. Thermal Heat Stress Alerts<br/>3. Soil Moisture Drought Depletion<br/>4. Post-Harvest Dry-down Guidance"]
    end

    POWER --> DecisionEngine
    GPM --> DecisionEngine
    SMAP --> DecisionEngine
    LANDSAT --> DecisionEngine
```

