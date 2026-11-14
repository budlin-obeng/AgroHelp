# 03. Scientific Methodology & Agro-Meteorological Models

This document details the scientific models, mathematical equations, and agronomic logic powering **AgroHelp** and the **Space2Soil** decision engine.

---

## 1. Agro-Meteorological Formulations

### 1.1 Modified Fournier Index (Rainfall Erosivity)
Rainfall erosivity governs the risk of topsoil stripping on bare farmland:
$$MFI = \frac{\sum_{i=1}^{12} p_i^2}{P_{\text{annual}}}$$
Where:
- $p_i$ is mean precipitation in month $i$ (mm).
- $P_{\text{annual}}$ is mean annual precipitation (mm).

**Ejura Decadal Value:** $MFI = 143.2$ (High Erosivity Class, $MFI > 120$).  
*Agronomic Implication:* Explains mathematically why continuous maize monoculture with post-harvest bare soil causes catastrophic topsoil degradation. Rotating in ground-covering legumes (Cowpea) or tubers (Cassava) maintains vegetative canopy cover and halts erosion.

---

### 1.2 Growing Degree Days (GDD) & Thermal Heat Stress
Thermal phenology drives crop development rates:
$$GDD = \sum \max\left(\frac{T_{\max} + T_{\min}}{2} - T_{\text{base}}, 0\right)$$
Where $T_{\text{base}} = 10^\circ C$ for maize and cowpeas.

**Heat Stress Trigger:**  
A day is flagged as a heat stress day (`is_heat_stress_day = 1`) whenever $T_{\max} \ge 35.0^\circ C$. In maize, temperatures $\ge 35^\circ C$ during flowering desiccate silk, kill pollen, and induce barren ear syndrome.

---

### 1.3 Readily Available Water (RAW) Soil Water Balance
Soil water availability is evaluated using the classical FAO-56 depletion formulation:
$$RAW = p \times TAW$$
$$TAW = 1000 \times (\theta_{\text{FC}} - \theta_{\text{WP}}) \times Z_r$$
Where:
- $\theta_{\text{FC}} = 0.28\text{ m}^3/\text{m}^3$ (Field Capacity for Chromic Luvisols in Ejura).
- $\theta_{\text{WP}} = 0.12\text{ m}^3/\text{m}^3$ (Permanent Wilting Point).
- $Z_r$ is crop rooting depth (0.8 m for maize, 0.6 m for cowpeas, 1.2 m for cassava).
- $p$ is the soil water depletion fraction ($p = 0.55$ for maize, $0.60$ for cowpea).

---

### 1.4 Standardized Drought Anomaly Z-Score
Drought occurrence is identified by evaluating satellite volumetric soil moisture ($\theta_t$) against the 10-year day-of-year climatological mean ($\mu_{\text{DOY}}$) and standard deviation ($\sigma_{\text{DOY}}$):
$$Z = \frac{\theta_t - \mu_{\text{DOY}}}{\sigma_{\text{DOY}}}$$
- An agricultural drought event is declared when $Z \le -1.0$.
- **557 daily agricultural drought occurrences** were identified in the 10-year Ejura dataset, predominantly concentrated in the late minor season and Harmattan dry window.

---

## 2. Biological Nitrogen Fixation (BNF) & Fertilizer Offset

Legume rotation contributions are calculated from validated West African Luvisol agronomic trials:
$$N_{\text{credit}} = Y_{\text{biomass}} \times \%N \times \text{Ndfa}$$
Where:
- $\text{Ndfa}$ is the percentage of nitrogen derived from the atmosphere via symbiotic *Rhizobium* nodules (~65–75% for Cowpea, ~60–70% for Soybean).
- **Cowpea BNF:** Fixes **40–70 kg N/ha**, directly offsetting ~35% of the synthetic fertilizer requirement for the following cereal crop.
- **Continuous Maize Monoculture:** Fixes **0 kg N/ha**, continually depleting the soil profile by ~75–100 kg N/ha per harvest.
