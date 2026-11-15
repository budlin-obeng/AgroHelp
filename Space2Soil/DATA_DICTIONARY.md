# Space2Soil: Agricultural Data Dictionary

This data dictionary defines all raw, cleaned, and derived variables across the Space2Soil historical agricultural database for **Ejura, Ashanti Region, Ghana** (Lat: `7.3856°`, Lon: `-1.3562°`).

---

## 1. Climate & Agroclimatology (NASA POWER)

### 1.1 Daily Climate Metrics (`nasa_power_ejura_daily_clean.csv`)

| Variable Name | Data Type | Units | Physical Bounds | Missing Value Code | Description & Agricultural Interpretation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `date` | String (ISO 8601) | `YYYY-MM-DD` | `2016-01-01` to `2025-12-31` | None | Calendar observation date. |
| `precipitation_mm_per_day` | Float64 | \(mm \cdot day^{-1}\) | \(0.0\) to \(500.0\) | `NaN` (raw `-999.0`) | Daily total precipitation corrected for gauge and model biases (`PRECTOTCORR`). Critical for crop planting dates and water balance. |
| `temperature_mean_c` | Float64 | \(^\circ C\) | \(5.0\) to \(50.0\) | `NaN` (raw `-999.0`) | Daily mean air temperature at 2 meters (`T2M`). Drives crop thermal degree-days (GDD) and phenological development. |
| `temperature_max_c` | Float64 | \(^\circ C\) | \(5.0\) to \(55.0\) | `NaN` (raw `-999.0`) | Daily maximum air temperature at 2 meters (`T2M_MAX`). Determines midday thermal stress and evapotranspiration spikes. |
| `temperature_min_c` | Float64 | \(^\circ C\) | \(5.0\) to \(45.0\) | `NaN` (raw `-999.0`) | Daily minimum air temperature at 2 meters (`T2M_MIN`). Indicates nighttime respiration rate and harmattan chilling events. |
| `relative_humidity_pct` | Float64 | \(\%\) | \(0.0\) to \(100.0\) | `NaN` (raw `-999.0`) | Daily mean relative humidity at 2 meters (`RH2M`). Affects vapor pressure deficit (VPD) and fungal/pest vulnerability. |
| `diurnal_temp_range_c` | Float64 | \(^\circ C\) | \(0.0\) to \(30.0\) | `NaN` | Derived: `temperature_max_c - temperature_min_c`. High values indicate cloudless, dry harmattan conditions; low values indicate humid monsoonal days. |
| `is_wet_day` | Integer (0/1) | Flag | `0` or `1` | None | Binary flag: `1` if daily precipitation \(\ge 1.0\text{ mm}\); `0` otherwise. Used for rainy day frequency. |
| `is_heavy_rain_day` | Integer (0/1) | Flag | `0` or `1` | None | Binary flag: `1` if daily precipitation \(\ge 25.0\text{ mm}\); `0` otherwise. Indicates risk of surface soil erosion, runoff, and waterlogging. |
| `is_heat_stress_day` | Integer (0/1) | Flag | `0` or `1` | None | Binary flag: `1` if `temperature_max_c` \(\ge 35.0^\circ C\); `0` otherwise. Critical threshold for maize tassel desiccation and pollen sterility. |

---

### 1.2 Monthly Aggregated Climate Metrics (`nasa_power_ejura_monthly_clean.csv`)

| Variable Name | Data Type | Units | Description & Agronomic Purpose |
| :--- | :--- | :--- | :--- |
| `year_month` | String | `YYYY-MM` | Year and month of aggregation (`2016-01` to `2025-12`). |
| `precipitation_total_mm` | Float64 | \(mm\) | Cumulative rainfall for the calendar month. Governs major/minor growing season demarcation. |
| `precipitation_mean_daily_mm` | Float64 | \(mm \cdot day^{-1}\) | Average daily rainfall across the month. |
| `precipitation_max_1day_mm` | Float64 | \(mm\) | Peak 24-hour rainfall intensity recorded within the month. |
| `rain_days_count` | Integer | Days | Total number of days with precipitation \(\ge 1.0\text{ mm}\). |
| `heavy_rain_days_count` | Integer | Days | Total number of days with torrential rain \(\ge 25.0\text{ mm}\). |
| `temperature_mean_c` | Float64 | \(^\circ C\) | Monthly mean air temperature. |
| `temperature_max_mean_c` | Float64 | \(^\circ C\) | Monthly mean of daily maximum temperatures. |
| `temperature_max_extreme_c` | Float64 | \(^\circ C\) | Absolute highest temperature recorded in the month. |
| `temperature_min_mean_c` | Float64 | \(^\circ C\) | Monthly mean of daily minimum temperatures. |
| `temperature_min_extreme_c` | Float64 | \(^\circ C\) | Absolute lowest temperature recorded in the month. |
| `diurnal_temp_range_mean_c` | Float64 | \(^\circ C\) | Average daily diurnal temperature range across the month. |
| `relative_humidity_mean_pct` | Float64 | \(\%\) | Monthly mean relative humidity. |
| `heat_stress_days_count` | Integer | Days | Count of days in the month where \(T_{\max} \ge 35.0^\circ C\). |
| `valid_days_count` | Integer | Days | Count of valid daily observations in the month (verifies completeness, 28–31). |

---

## 2. Satellite Precipitation (NASA GPM IMERG)

| Variable Name | Data Type | Units | Nominal Depth / Resolution | Description |
| :--- | :--- | :--- | :--- | :--- |
| `precipitationCal` | Float32 | \(mm \cdot hr^{-1}\) or \(mm \cdot day^{-1}\) | 0.1° × 0.1° (~10 km) grid | Multi-satellite precipitation estimate with gauge calibration. |
| `precipitation_variability` | Float64 | Coefficient of Variation | 0.1° grid | Standard deviation of rainfall divided by the seasonal mean. |
| `extreme_rainfall_period` | String / Flag | Categorical | 0.1° grid | Identified period of consecutive heavy rainfall (\(> 95^{\text{th}}\) percentile) inducing flood risk. |

---

## 3. Satellite Soil Moisture (NASA SMAP)

| Variable Name | Data Type | Units | Sensor / Model Depth | Description & Agricultural Value |
| :--- | :--- | :--- | :--- | :--- |
| `soil_moisture_surface` | Float32 | \(m^3 \cdot m^{-3}\) (volumetric) | Top 0–5 cm (SMAP Radiometer) | Surface soil moisture. Informs seed germination, tillage suitability, and crusting. |
| `soil_moisture_rootzone` | Float32 | \(m^3 \cdot m^{-3}\) (volumetric) | 0–100 cm profile (SMAP L4 Assimilation) | Root-zone soil moisture available for plant transpiration. Key drought indicator. |
| `soil_moisture_anomaly` | Float64 | Z-score / % departure | 0–100 cm | Standard deviation units departure from 10-year climatological mean for the given calendar week. |

---

## 4. Earth Observation Vegetation Indices (NASA/USGS Landsat 8/9)

| Variable Name | Data Type | Units / Scale | Spatial Resolution | Formula / Description |
| :--- | :--- | :--- | :--- | :--- |
| `B4_red` | Float32 | Reflectance (0.0–1.0) | 30 m | Band 4 Surface Reflectance (\(640–670\text{ nm}\)). Absorbed by chlorophyll. |
| `B5_nir` | Float32 | Reflectance (0.0–1.0) | 30 m | Band 5 Near-Infrared Surface Reflectance (\(850–880\text{ nm}\)). Reflected by mesophyll cell structure. |
| `NDVI` | Float32 | Index \([-1.0, 1.0]\) | 30 m | \(\frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}\). Canopy greenness, biomass density, and photosynthetic activity. |
| `EVI` | Float32 | Index \([-1.0, 1.0]\) | 30 m | \(2.5 \cdot \frac{\text{NIR} - \text{Red}}{\text{NIR} + 6.0 \cdot \text{Red} - 7.5 \cdot \text{Blue} + 1.0}\). Enhanced vegetation index, reduces soil background and atmospheric saturation in dense canopies. |
| `cloud_mask_valid` | Boolean | True / False | 30 m | Pixel quality QA mask indicating clear sky land surface (free of cloud, cloud shadow, cirrus, or saturation). |

---

## 5. Evapotranspiration & Plant Water Stress (NASA ECOSTRESS / PT Model)

| Variable Name | Data Type | Units | Sensor / Model | Physical Bounds | Description & Agricultural Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `et_mm_day` | Float64 | \(mm \cdot day^{-1}\) | ECOSTRESS / Priestley-Taylor | \(0.0\) to \(15.0\) | Daily actual crop evapotranspiration. Quantifies water consumption of crops and soil evaporation. |
| `pet_mm_day` | Float64 | \(mm \cdot day^{-1}\) | Penman-Monteith Reference | \(0.0\) to \(20.0\) | Daily potential evapotranspiration under well-watered reference conditions. |
| `evaporative_stress_index` | Float64 | Ratio \([0.0, 1.0]\) | \(ET / PET\) | \(0.0\) to \(1.0\) | Evaporative Stress Index (ESI). Values \(< 0.4\) indicate severe moisture limitation and stomatal closure. |
| `annual_water_balance_mm` | Float64 | \(mm \cdot year^{-1}\) | GPM Rainfall \(-\) ET | \(-500\) to \(+1500\) | Net hydrological balance. Positive indicates recharge surplus; negative indicates drought deficit. |

---

## 6. Soil Physical & Chemical Properties (ISRIC SoilGrids v2.0)

| Variable Name | Data Type | Units | Sampling Depths | Resolution | Description & Agricultural Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `phh2o` | Float64 | pH units | 0–5, 5–15, 15–30, 30–60, 60–100 cm | 250 m | Soil pH measured in water. Determines nutrient availability and crop acidity tolerance. (Ejura = 6.6 neutral). |
| `clay` | Float64 | \(g \cdot kg^{-1}\) (%) | 0–5, 5–15, 15–30, 30–60, 60–100 cm | 250 m | Clay mineral content (<0.002 mm). Drives cation retention and subsoil water holding capacity (17.3% topsoil &rarr; 38.1% subsoil). |
| `sand` | Float64 | \(g \cdot kg^{-1}\) (%) | 0–5, 5–15, 15–30, 30–60, 60–100 cm | 250 m | Sand fraction (0.05–2.0 mm). Governs topsoil drainage and aeration (68.6% topsoil). |
| `silt` | Float64 | \(g \cdot kg^{-1}\) (%) | 0–5, 5–15, 15–30, 30–60, 60–100 cm | 250 m | Silt mineral fraction (0.002–0.05 mm). Affects soil cohesion and crusting susceptibility (14.1% topsoil). |
| `soc` | Float64 | \(g \cdot kg^{-1}\) | 0–5, 5–15, 15–30, 30–60, 60–100 cm | 250 m | Soil Organic Carbon. Drives microbial fertility and moisture retention (39.3 g/kg topsoil). |
| `bdod` | Float64 | \(g \cdot cm^{-3}\) | 0–5, 5–15, 15–30, 30–60, 60–100 cm | 250 m | Bulk density of dry fine earth. Informs root penetration resistance and compaction (1.44–1.55 g/cm³). |
| `cec` | Float64 | \(mmol(c) \cdot kg^{-1}\) | 0–5, 5–15, 15–30, 30–60, 60–100 cm | 250 m | Cation Exchange Capacity. Indicates nutrient reservoir capacity (29.7 mmol/kg). |
| `nitrogen` | Float64 | \(g \cdot kg^{-1}\) | 0–5, 5–15, 15–30, 30–60, 60–100 cm | 250 m | Total Kjeldahl nitrogen content. Baseline organic nitrogen before fertilization or legume crediting (4.46 g/kg). |

