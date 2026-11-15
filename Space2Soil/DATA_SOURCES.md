# Space2Soil: NASA Earth Observation Data Sources

**Project:** Space2Soil (NASA Space Apps Challenge: "Field Shift: Adapting Farms with NASA Data")  
**Target Pilot Location:** Ejura, Ashanti Region, Ghana  
**Coordinates:** Latitude `7.3856° N`, Longitude `-1.3562° W`  
**Temporal Window:** January 1, 2016 – December 31, 2025 (10-Year Decadal Baseline)

---

## 1. Overview of Data Sources

| Source / Mission | Instrument / Model | Primary Product | Spatial Resolution | Temporal Resolution | Access Protocol | Authentication Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NASA POWER** | MERRA-2 Assimilation & GEOS FP-IT | Agroclimatology Daily Point (`community=AG`) | 0.5° × 0.625° (~50 km × 60 km) | Daily (2016–2025) | REST API (JSON/CSV) | **No** (Open Public API) |
| **NASA GPM** | Dual-frequency Precip Radar & GMI (Constellation) | IMERG Final Precipitation L3 (`GPM_3IMERGDF` / `GPM_3IMERGM`) | 0.1° × 0.1° (~10 km × 10 km) | Daily & Monthly | NASA GES DISC / CMR / OPeNDAP | **Yes** (Earthdata Login URS) |
| **NASA SMAP** | L-band Radiometer (1.4 GHz) | L3/L4 Surface & Root-Zone Soil Moisture (`SPL3SMP_E` / `SPL4SMAU`) | 9 km / 36 km / 11 km grid | Daily / 3-Hourly | NASA NSIDC DAAC / CMR | **Yes** (Earthdata Login URS) |
| **USGS / NASA Landsat** | OLI / OLI-2 & TIRS / TIRS-2 (Landsat 8 & 9) | Collection 2 Level-2 Surface Reflectance (SR) | 30 m × 30 m | 16-day (8-day combined) | USGS STAC / Planetary Computer STAC | **No** (Open via Signed STAC) / Yes for direct USGS EROS |
| **NASA ECOSTRESS** | Multispectral Thermal Infrared Radiometer (ISS) | Evapotranspiration & ESI (`ECO3ETPTJPL` / PT Model) | 70 m / Field-Scale | 1–5 Days (ISS Orbit) | NASA LP DAAC / AppEEARS | **Yes** (Earthdata Login) / Model Fallback Open |
| **ISRIC SoilGrids** | Machine Learning Digital Soil Mapping (2020) | Soil Properties v2.0 (pH, Clay, Sand, SOC, BD, CEC, N) | 250 m × 250 m | Static Multi-Depth (0–100 cm) | ISRIC REST API (JSON) | **No** (Open Public API) |

---

## 2. Spatial Resolution & Farm-Level Agricultural Caveat

> [!IMPORTANT]
> **Spatial Scale Disclaimer for Space2Soil Decision Engine:**  
> Satellite observations and global reanalysis grids operate at distinct spatial scales. In Space2Soil, satellite products must **not** be presented as uncalibrated single-farm measurements:
> - **NASA POWER (0.5° × 0.625°, ~50 km):** Captures synoptic atmospheric conditions, regional temperature trends, and regional solar insolation. Local microclimates (such as valley bottoms or shaded forest edges in Ejura) may exhibit thermal departures.
> - **NASA GPM IMERG (0.1° × 0.1°, ~10 km):** Significantly higher spatial fidelity than atmospheric reanalysis, resolving convective storm clusters and mesoscale rainfall gradients across the Ashanti agricultural belt.
> - **NASA SMAP (9–36 km):** Provides regional volumetric soil water content (\(m^3/m^3\)) integrated over large landscape patches. Local soil texture variations (e.g., sandy loam vs. plinthite clay pans) govern field-scale water retention.
> - **NASA/USGS Landsat 8/9 (30 m):** Resolves field-scale agricultural parcels, farm boundaries, canopy vigor, and intra-field vegetation stress.

---

## 3. Detailed Data Acquisition Channels

### 3.1 NASA POWER Agroclimatology API
- **Endpoint:** `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Method:** HTTP GET
- **Community:** `AG` (Agroclimatology)
- **Parameters Acquired:**
  - `PRECTOTCORR`: Corrected Total Precipitation (\(mm/day\))
  - `T2M`: Daily Mean Air Temperature at 2 m (\(^\circ C\))
  - `T2M_MAX`: Daily Maximum Air Temperature at 2 m (\(^\circ C\))
  - `T2M_MIN`: Daily Minimum Air Temperature at 2 m (\(^\circ C\))
  - `RH2M`: Daily Relative Humidity at 2 m (\(\%\))
- **Status:** **Fully Acquired and Validated (3,653 days / 100% complete).**

### 3.2 NASA GPM (Global Precipitation Measurement) IMERG
- **Host Archive:** NASA GES DISC (Goddard Earth Sciences Data and Information Services Center)
- **Product:** `GPM_3IMERGDF` (Daily Final Run) and `GPM_3IMERGM` (Monthly Final Run) v06 / v07.
- **Access Protocol:**
  - NASA CMR Search API: `https://cmr.earthdata.nasa.gov/search/granules.json` (open metadata search).
  - Data Granule Retrieval: Direct HTTPS download via `https://gpm1.gesdisc.eosdis.nasa.gov/data/` or GES DISC OPeNDAP server.
- **Authentication:** Requires NASA Earthdata Login account with authorization granted to **NASA GESDISC DATA ARCHIVE**.

### 3.3 NASA SMAP (Soil Moisture Active Passive)
- **Host Archive:** NASA NSIDC DAAC (National Snow and Ice Data Center Distributed Active Archive Center)
- **Products:**
  - `SPL3SMP_E`: SMAP Enhanced L3 Radiometer Global Daily 9 km EASE-Grid Soil Moisture (Top 0–5 cm surface layer).
  - `SPL4SMAU`: SMAP L4 Global 3-hourly 9 km Surface and Root-Zone Soil Moisture (Surface 0–5 cm and Root-zone 0–100 cm profile).
- **Access Protocol:** NASA CMR Granule Search + NSIDC HTTPS Data Pool (`https://n5eil01u.ecs.nsidc.org/`).
- **Authentication:** Requires NASA Earthdata Login account with authorization granted to **NSIDC**.

### 3.4 Landsat 8 & 9 Collection 2 Level-2 Surface Reflectance
- **Host Archive:** USGS EROS / NASA LP DAAC / Microsoft Planetary Computer / AWS Open Data
- **Products:**
  - Landsat 8-9 OLI/TIRS Collection 2 Level-2 Surface Reflectance (Tile: Path 194, Row 54 covering Ejura, Ghana).
  - Bands: Band 4 (Red, 640–670 nm), Band 5 (Near-Infrared / NIR, 850–880 nm), QA_PIXEL (Quality Assessment and Cloud Masking).
- **Access Protocol:** SpatioTemporal Asset Catalog (STAC) API (`https://planetarycomputer.microsoft.com/api/stac/v1/search`) with automated Blob SAS Token generation for open 30m GeoTIFF access.
- **Status:** Cloud-optimized GeoTIFFs (COG) accessible without Earthdata authentication.

### 3.5 NASA ECOSTRESS (Ecosystem Spaceborne Thermal Radiometer on Space Station)
- **Host Archive:** NASA LP DAAC (Land Processes Distributed Active Archive Center).
- **Products:**
  - `ECO3ETPTJPL`: Instantaneous and daily actual evapotranspiration (ET) derived via Priestley-Taylor Jet Propulsion Laboratory algorithm.
  - `ECO4ESI`: Evaporative Stress Index (ESI = ET / PET) identifying water stress hotspots.
- **Access Protocol:** NASA AppEEARS REST API (`https://appeears.earthdatacloud.nasa.gov/api/`) point query extraction for Ejura demonstration site.
- **Representative Benchmark:** Integrated with Priestley-Taylor model driven by NASA POWER and SMAP observations (mean annual ET: 1,025.2 mm/year; net annual water surplus: +383.5 mm).

### 3.6 ISRIC SoilGrids v2.0 Global Soil Information System
- **Host Archive:** ISRIC — World Soil Information (Wageningen, Netherlands) in partnership with FAO.
- **Products:**
  - Standardized physical and chemical properties at 250 m spatial resolution across 5 standard depth intervals (0–5 cm, 5–15 cm, 15–30 cm, 30–60 cm, 60–100 cm).
  - Properties: pH in H2O (`phh2o`), Clay content (`clay`), Sand content (`sand`), Silt content (`silt`), Soil Organic Carbon (`soc`), Bulk Density (`bdod`), Cation Exchange Capacity (`cec`), Total Nitrogen (`nitrogen`).
- **Access Protocol:** ISRIC SoilGrids REST API (`https://rest.isric.org/soilgrids/v2.0/properties/query`) without authentication barrier.
- **Findings for Ejura:** Topsoil (0–5 cm) pH 6.6 (neutral), SOC 39.3 g/kg, bulk density 1.44 g/cm³. Argic clay accumulation horizon confirmed in subsoil (17.3% clay topsoil &rarr; 38.1% clay subsoil at 60–100 cm), validating Chromic Luvisol classification.

