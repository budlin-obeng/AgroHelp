# AgroHelp System Architecture & Repository Blueprint

This document explains the structural layout, system components, data contracts, and cross-functional responsibilities across the **AgroHelp** project.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Layer1["1. NASA Earth Observation Data Pipeline (Space2Soil/)"]
        direction TB
        RAW["Raw NASA Observations<br/>• NASA POWER (MERRA-2 Climatology)<br/>• NASA GPM IMERG (Precipitation)<br/>• NASA SMAP (Surface & Root Moisture)<br/>• USGS Landsat 8/9 (30m NDVI)"]
        PREPROCESS["Pipeline Scripts (src/preprocessing/)<br/>• Quality masking & temporal aggregation<br/>• Export 10-year clean decadal baselines"]
        CLEAN_DATA["Processed Archive (data/processed/)<br/>• 3,653 daily records (2016–2025)<br/>• 557 drought anomaly events ($Z \le -1.0$)<br/>• MFI Erosivity Index ($143.2$)"]
        RAW --> PREPROCESS --> CLEAN_DATA
    end

    subgraph Layer2["2. Backend & Machine Learning Engine (backend/)"]
        direction TB
        LOADER["Data Loader (core/data_loader.py)<br/>Direct ingestion of decadal data"]
        ML_ENGINE["ML Recommendation Engine (ml/engine.py)<br/>• MultiOutput GradientBoosting Regressor<br/>• Multi-objective Pareto Trade-off Engine<br/>• Pluggable Model Loader (ml/model_loader.py)"]
        API_LAYER["FastAPI REST Gateway (api/routes.py)<br/>• POST /api/v1/predict-rotations<br/>• POST /api/v1/tradeoffs<br/>• GET /api/v1/pilot-data<br/>• GET /api/v1/environmental-profile"]
        LOADER --> ML_ENGINE --> API_LAYER
    end

    subgraph Layer3["3. Farmer Web Application (frontend/)"]
        direction TB
        MAP["Interactive Farm Map (components/FarmMap.jsx)<br/>• Leaflet GPS locator & Ejura cluster selector"]
        INPUTS["Farmer Profile Controls (components/FarmProfileControls.jsx)<br/>• Land size, standing crop, soil type<br/>• Reactive sliders: Income, Fertilizer, FAW, Drought"]
        PRED_CARDS["ML Prediction Cards (components/MLPredictionCards.jsx)<br/>• Dynamic rotation rankings & suitability gauge<br/>• Fertilizer savings % & FAW break score"]
        TRADEOFFS["Trade-off Explorer (components/TradeoffExplorer.jsx)<br/>• Multi-dimensional agronomic comparison bars"]
        TELEMETRY["NASA Telemetry (components/NasaIndicatorsDashboard.jsx)<br/>• 10-year climate trends & monthly curves"]
    end

    CLEAN_DATA ==> LOADER
    API_LAYER <==> MAP & INPUTS & PRED_CARDS & TRADEOFFS & TELEMETRY
```

---

## 2. Directory Layout & Functional Ownership

The repository is structured into four distinct, self-contained functional pillars:

```text
AgroHelp/
│
├── Space2Soil/               <- LAYER 1: NASA Data Science & Earth Observation Pipeline
│   ├── data/                 <- 10-Year Decadal Archive (Raw, Processed, Metadata)
│   ├── src/                  <- Acquisition, preprocessing, analysis & validation scripts
│   ├── notebooks/            <- Exploratory Jupyter notebooks (Phases 2, 3, 4)
│   ├── web/                  <- Standalone lightweight cockpit & visualizer
│   └── app.py                <- Zero-dependency HTTP gateway for standalone mode
│
├── backend/                  <- LAYER 2: Application Backend & Machine Learning Engine
│   ├── app/
│   │   ├── api/              <- FastAPI REST routers & endpoint definitions
│   │   ├── core/             <- Configuration, settings & decadal data loader
│   │   ├── ml/               <- GradientBoosting ML engine, crop biology & model loaders
│   │   └── schemas/          <- Pydantic validation schemas for requests & responses
│   └── tests/                <- Pytest test suite (17/17 tests passing)
│
├── frontend/                 <- LAYER 3: Farmer Decision-Support Web Dashboard
│   ├── src/
│   │   ├── components/       <- React UI: Map, priority sliders, ML cards, tradeoff explorer
│   │   ├── services/         <- Resilient API client with fallback simulation
│   │   └── assets/           <- GeoJSON boundaries, icons, and styling
│   └── package.json          <- React 18, Vite, Tailwind CSS, Leaflet, Lucide
│
├── docs/                     <- LAYER 4: Central Knowledge Base & Technical Documentation
│   ├── README.md             <- Master documentation index
│   ├── 01_mofa_ejura_context.md       <- Ministry of Food & Agriculture local reality
│   ├── 02_nasa_earth_observation.md   <- Satellite specifications & scale caveats
│   ├── 03_scientific_methodology.md   <- Agro-meteorological models & mathematical formulas
│   ├── 04_ml_recommendation_engine.md <- ML model architecture & tradeoff calculations
│   ├── 05_api_reference.md           <- REST endpoint contracts & payload schemas
│   └── 06_competition_pitch_guide.md  <- 3-minute challenge pitch script & slides
│
├── scripts/                  <- LAYER 5: 1-Click Developer Productivity Suite
│   ├── dev-backend.bat / .ps1         <- Launch FastAPI backend server
│   ├── dev-frontend.bat / .ps1        <- Launch React Vite development server
│   ├── dev-space2soil.bat / .ps1      <- Launch Space2Soil standalone cockpit
│   └── run-all-tests.ps1              <- Run all 27 automated tests across subsystems
│
├── Info/                     <- Original problem roadmap & hackathon challenge notes
├── .env.example              <- Environment configuration template
├── .gitignore                <- Comprehensive repository ignore rules
└── README.md                 <- Master project overview & quickstart guide
```

---

## 3. Communication & Data Flow

1. **Space2Soil $\rightarrow$ Backend**:
   - `backend/app/core/data_loader.py` reads clean decadal CSVs directly from `Space2Soil/data/processed/`.
   - Ingests 3,653 daily climate records, 3,653 daily rainfall records, 3,653 daily soil moisture records, and 557 drought events into memory.
2. **Backend $\rightarrow$ Machine Learning Engine**:
   - `backend/app/ml/engine.py` extracts agro-meteorological features from the loaded decadal baseline and combines them with farmer priorities.
   - Evaluates rotation candidates dynamically using `MultiOutputRegressor(GradientBoostingRegressor)` or hot-loads any `.joblib` model provided by the data science collaborator in `Space2Soil/`.
3. **Backend $\rightarrow$ Frontend**:
   - FastAPI serves REST endpoints on port `8000` with full CORS support.
   - `frontend/src/services/api.js` queries `/api/v1/predict-rotations` with farmer inputs, updating recommendations and trade-offs in real time.
