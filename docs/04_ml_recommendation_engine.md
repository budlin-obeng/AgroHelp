# 04. Machine Learning & Multi-Objective Trade-Off Engine

This document details the machine learning architecture and multi-objective decision engine in `backend/app/ml/`.

---

## 1. Machine Learning Model Architecture

AgroHelp does **not** rely on static hardcoded recommendations. It employs a dynamic machine learning pipeline that evaluates farm parameters, local soil characteristics, and NASA agroclimatology to predict rotation outcomes and quantify trade-offs.

### 1.1 Regressor Formulation
The active model uses a scikit-learn `MultiOutputRegressor` wrapping `GradientBoostingRegressor`:
```python
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import GradientBoostingRegressor

base_regressor = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.08,
    max_depth=4,
    random_state=42
)
model = MultiOutputRegressor(base_regressor)
```

### 1.2 Target Output Dimensions
For every evaluated crop rotation candidate, the model predicts four continuous target variables:
1. **`predicted_suitability_score`** ($0 - 100$): Overall agro-ecological suitability under current and forecasted conditions.
2. **`expected_gross_margin_ghs`** ($\text{GHS/ha}$): Projected net profitability per hectare based on local aggregation prices.
3. **`fertilizer_savings_pct`** ($0 - 50\%$): Synthetic fertilizer expenditure reduction achieved through biological nitrogen fixation and organic matter recycling.
4. **`faw_disruption_index`** ($0 - 100$): Efficacy in disrupting the Fall Armyworm larval breeding cycle.

---

## 2. Feature Vector Engineering

The feature vector passed to the model combines three categories of variables:

| Feature Category | Variables Extracted | Source |
| :--- | :--- | :--- |
| **Environmental Features** | Annual Rainfall, Major/Minor Season Totals, Mean Temp, Max Temp, Drought Event Frequency, Topsoil Wetness Index | NASA Decadal Baseline (`Space2Soil/data/processed/`) |
| **Farm Features** | Soil Texture Index (Sandy Loam: 1.0, Clay Loam: 1.2), Farm Size (ha), Standing Baseline Crop | Farmer Input Form |
| **Priority Weights** | $w_{\text{market}}$, $w_{\text{fert}}$, $w_{\text{faw}}$, $w_{\text{drought}}$ (normalized so $\sum w_i = 1.0$) | Farmer Priority Sliders |

---

## 3. Pluggable External Model Loader (`backend/app/ml/model_loader.py`)

To ensure seamless collaboration with data science teammates working in `Space2Soil/`:
- The backend checks for trained model artifacts in:
  1. `backend/app/ml/models/crop_rotation_model.joblib`
  2. `Space2Soil/models/crop_rotation_model.joblib`
  3. `Space2Soil/models/crop_rotation_model.pkl`
- If an external model file is dropped into `Space2Soil/models/`, the backend automatically detects, loads, and validates it.
- If no external artifact is present, the built-in trained `GradientBoostingRegressor` runs automatically.

---

## 4. Multi-Objective Pareto Trade-Off Engine

Instead of presenting an unexplained single score, the engine computes explicit agronomic trade-offs comparing candidate practices against the farmer's current baseline:

```
Trade-Off Dimensions Analyzed:
├── 1. Short-term Cash Income vs. Long-term Soil Carbon & Nitrogen
├── 2. Pest Disruption Efficacy vs. Seed Inoculation & Storage Labor
├── 3. Drought Insurance Cushion vs. Harvesting Time Horizon
└── 4. Synthetic Input Expenditure vs. Biological Self-Sufficiency
```

For each candidate, the response includes an explicit `tradeoffs` block detailing advantages, trade-offs, and field management requirements.
