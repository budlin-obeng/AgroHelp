# 02. NASA Earth Observation Data Guide

This document details the multi-sensor NASA Earth Observation products integrated into **AgroHelp** and the **Space2Soil** data pipeline for the **Ejura, Ghana** pilot (`7.3856° N, -1.3562° W`).

---

## 1. Multi-Sensor Data Matrix

| NASA Product / Mission | Sensor / Algorithm | Spatial Resolution | Temporal Scope | Primary Agricultural Indicators Extracted |
| :--- | :--- | :--- | :--- | :--- |
| **NASA POWER** (Agroclimatology) | MERRA-2 Assimilation & GEOS-5 | 0.5° × 0.625° (~50 km) | 2016–2025 (3,653 Days) | `T2M` (Mean Temp), `T2M_MAX`, `T2M_MIN`, `RH2M`, `is_heat_stress_day` ($T \ge 35^\circ C$). |
| **NASA GPM IMERG** | Multi-satellite precipitation with gauge calibration | 0.1° × 0.1° (~10 km) | 2016–2025 (3,653 Days) | `precipitation_mm_per_day`, 10-year total (14,088 mm), 126 extreme rainfall events. |
| **NASA SMAP** | L-band Radiometer & GMAO Soil Model | 9 km grid | 2016–2025 (3,653 Days) | Surface (0–5 cm) and root-zone (0–100 cm) volumetric moisture ($\theta \approx 0.25\text{ m}^3/\text{m}^3$), 557 drought events ($Z \le -1.0$). |
| **USGS / NASA Landsat 8 & 9** | OLI / TIRS Collection 2 Level-2 | 30 m × 30 m | 454 Overpasses (115 Clear) | Cloud-masked NDVI & EVI rasters: Dry season (0.28), Major peak (0.74), Minor peak (0.66). |

---

## 2. Spatial Scale Disclaimers & Translation

> [!IMPORTANT]
> **Spatial Scale Disclaimer (NASA Award Criteria):**  
> Satellite observations operate across distinct macro, meso, and field scales. In AgroHelp, we maintain strict scientific integrity by never claiming macro-scale data as direct in-situ measurements:
> - **NASA POWER (~50 km):** Captures regional synoptic thermal regimes, solar insolation, and air mass characteristics. Micro-climates (such as valley bottoms or shaded forest edges in Ejura) may exhibit thermal variance.
> - **NASA GPM IMERG (~10 km):** Captures convective storm cells and regional rainfall gradients across the northern Ashanti transition belt.
> - **NASA SMAP (9 km):** Reflects regional soil water reserves and macro-drought anomalies. Field-scale drainage depends on local soil texture.
> - **Landsat 8/9 (30 m):** Resolves field-scale farm parcels, canopy vigor differences, and bare soil exposure duration.

---

## 3. Data Flow into the AgroHelp Decision Engine

```
10-Year Decadal NASA Baseline (Space2Soil/data/processed/)
   ├── 3,653 Daily Climate Days (POWER)
   ├── 3,653 Daily Rainfall Days (GPM)
   ├── 3,653 Daily Soil Moisture Days (SMAP)
   └── 454 Landsat Scenes (30m NDVI)
            │
            ▼
Data Loader & Feature Engineering (backend/app/core/data_loader.py)
   ├── Decadal Climatologies (Mean Annual Rain: 1,408 mm, Mean Temp: 26.8°C)
   ├── Agricultural Drought Anomaly Counts (557 days)
   └── Growing Season Demarcations (Major: Apr–Jul, Minor: Sep–Nov)
            │
            ▼
Machine Learning Model & Trade-Off Engine (backend/app/ml/engine.py)
   ├── MultiOutputRegressor (GradientBoostingRegressor)
   └── Multi-Objective Pareto Trade-off Quantification
            │
            ▼
Farmer & Extension Interfaces
   ├── AgroHelp React Dashboard (frontend/)
   └── Space2Soil Standalone Cockpit (Space2Soil/web/)
```
