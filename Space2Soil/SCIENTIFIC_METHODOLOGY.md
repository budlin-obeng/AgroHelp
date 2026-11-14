# Space2Soil: Scientific Analysis Methodology & Agronomic Model

**Project:** Space2Soil (NASA Space Apps Challenge: "Field Shift: Adapting Farms with NASA Data")  
**Target Location:** Ejura, Ashanti Region, Ghana (`7.3856° N, -1.3562° W`)  
**Phase:** Phase 3 – Scientific Analysis & Agricultural Indicators  
**Author:** Senior Geospatial Data Engineer & Agricultural Data Scientist  

---

## 1. Scientific Overview & Analytical Framework

Phase 3 transitions the Space2Soil initiative from data engineering into **applied agro-meteorology and predictive crop intelligence**. Using the 10-year decadal baseline (2016–2025, 3,653 continuous days) established across NASA POWER, GPM IMERG, SMAP, and Landsat 8/9, this analytical model addresses the core challenges of farming in the West African forest-savannah transition zone:

1. **Unpredictable Season Onset & False Starts:** High risk of seed desiccation when early March rains are followed by prolonged dry spells.
2. **Mid-Season Dry Spells:** Convective dry gaps in June/July coinciding with maize silking and pollination.
3. **Midday Heat Spikes:** Daytime temperatures surpassing the physiological sterility threshold ($35^\circ C$).
4. **Soil Moisture Depletion:** Topsoil drying ($0–5\text{ cm}$) versus root-zone buffer retention ($0–100\text{ cm}$) in sandy loam ochrosols.
5. **Crop Rotation & Climate Adaptation:** Multi-criteria scoring to design climate-resilient rotations between cereals, legumes, and roots/tubers.

---

## 2. Mathematical Formulations & Analytical Models

### 2.1 Agricultural Season Onset, Cessation & LGP Model

The agricultural onset model adapts the validated West African Monsoon agro-climatic criteria (Stern et al., 2006; FAO Agro-ecological Zoning):

- **Major Season Onset Date ($D_{\text{onset}}$):**  
  The first date after March 1 (Day of Year $\ge 60$) that satisfies two simultaneous conditions:
  1. A cumulative 3-day rainfall total exceeding $20\text{ mm}$:
     $$\sum_{t=0}^{2} P_{t} \ge 20.0\text{ mm}$$
  2. No dry spell exceeding 7 consecutive dry days ($P < 1.0\text{ mm}$) occurs within the subsequent 21 days:
     $$\max(\text{ConsecutiveDays}(P < 1.0\text{ mm}))_{t+3}^{t+23} \le 7\text{ days}$$
  *Rationale:* Filters out deadly "false planting starts" that cause germinated seedlings to wither.

- **Season Cessation Date ($D_{\text{cessation}}$):**  
  The last date before November 30 where the 3-day rainfall sum exceeds $15\text{ mm}$ prior to soil profile dry-down.

- **Length of Growing Period ($LGP$):**
  $$LGP = \text{DOY}(D_{\text{cessation}}) - \text{DOY}(D_{\text{onset}})\quad (\text{days})$$

---

### 2.2 Thermal Accumulation & Heat Stress Model

Crop development rate is driven by effective thermal degree-days above crop-specific base temperatures:

- **Growing Degree Days ($GDD$):**
  $$GDD = \max\left(0, \frac{\min(T_{\max}, T_{\text{cutoff}}) + T_{\min}}{2} - T_{\text{base}}\right)$$
  - For Maize, Cowpea, and Soybean: $T_{\text{base}} = 10.0^\circ C$, $T_{\text{cutoff}} = 35.0^\circ C$.
  - For Cassava and Yam: $T_{\text{base}} = 15.0^\circ C$.

- **Critical Heat Stress Index ($HSI$):**  
  Count of days where midday temperatures exceed the pollen sterility threshold for maize:
  $$\text{HeatStressDay} = \begin{cases} 1 & \text{if } T_{\max} \ge 35.0^\circ C \\ 0 & \text{otherwise} \end{cases}$$

---

### 2.3 Soil Profile Water Balance & Available Water Capacity ($AWC$)

Ejura soils are predominantly Savannah Ochrosols (sandy loam topsoil over plinthite/loam subsoil). Based on local pedological soil water retention characteristics:
- Saturated water content / Porosity ($\theta_{\text{sat}}$): $0.43\text{ m}^3/\text{m}^3$
- Field Capacity ($\theta_{\text{fc}}$): $0.28\text{ m}^3/\text{m}^3$
- Permanent Wilting Point ($\theta_{\text{pwp}}$): $0.14\text{ m}^3/\text{m}^3$

- **Readily Available Water Fraction ($RAW$):**
  $$RAW = \frac{\theta_{\text{rootzone}} - \theta_{\text{pwp}}}{\theta_{\text{fc}} - \theta_{\text{pwp}}}$$
  - $RAW \ge 0.50$: Optimal soil moisture (unrestricted transpiration).
  - $0.20 \le RAW < 0.50$: Moderate water stress (stomata begin closing, leaf rolling).
  - $RAW < 0.20$: Severe agricultural drought / wilting danger.

- **Soil Profile Vertical Gradient ($\Delta \theta$):**
  $$\Delta \theta = \theta_{\text{surface (0-5cm)}} - \theta_{\text{rootzone (0-100cm)}}$$
  *Diagnostic Significance:* Negative values quantify rapid surface crusting/evaporation while the root-zone retains critical moisture reserves.

---

### 2.4 Rainfall Erosivity & Runoff Vulnerability ($R$-Factor)

Torrential convective downpours typical of the transition zone detach topsoil particles. Erosivity is modeled using the Modified Fournier Index ($MFI$) and the Arnoldus RUSLE approximation:
$$MFI = \frac{\sum_{m=1}^{12} P_m^2}{\sum_{m=1}^{12} P_m}$$
$$R = 0.264 \cdot MFI^{1.50}$$
Where $P_m$ is cumulative rainfall in month $m$. In Ejura, decadal $MFI$ averages $> 140$, categorizing the area as having **High to Very High soil erosion vulnerability**.

---

### 2.5 Multi-Criteria Crop Suitability Scoring Engine

Crop suitability ($S_{\text{crop}}$) is computed on a scale of $0$ to $100$ as a weighted multi-criteria decision model:
$$S_{\text{crop}} = 0.40 \cdot S_{\text{rainfall}} + 0.35 \cdot S_{\text{soil\_moisture}} + 0.25 \cdot S_{\text{temperature}}$$

#### Agronomic Evaluation Matrix

| Crop | Growing Cycle | Optimum Rain (mm) | Temperature Range | Drought Sensitivity | Decadal Score | FAO Class |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cassava (*Manihot esculenta*)** | 9–12 months | 800 – 1,400 mm | 24 – 32 °C | Low | **92.8** | **S1 (Highly Suitable)** |
| **Cowpea (*Vigna unguiculata*)** | 60–75 days | 300 – 500 mm | 24 – 32 °C | Low | **89.0** | **S1 (Highly Suitable)** |
| **Maize (*Zea mays*)** | 90–110 days | 500 – 800 mm | 22 – 30 °C | High | **89.0** | **S1 (Highly Suitable)** |
| **Yam (*Dioscorea rotundata*)** | 7–8 months | 1,000 – 1,400 mm | 25 – 30 °C | Medium-High | **75.1** | **S2 (Moderately Suitable)** |
| **Soybean (*Glycine max*)** | 90–105 days | 450 – 700 mm | 22 – 30 °C | Medium | **66.9** | **S2 (Moderately Suitable)** |

---

## 3. Decadal Scientific Findings for Ejura, Ghana

1. **Seasonality Stability:**
   - Average Major Season onset: **March 22 – April 8** (DOY 81 – 98).
   - Average Length of Growing Period ($LGP$): **224 days**, spanning both major and minor cycles.
2. **Dry Spell Vulnerability:**
   - 32 significant dry spells ($\ge 5$ days) recorded during active growing months across the decade.
   - The mid-summer dry spell (typically late July to mid-August) is the single greatest risk factor for early-planted maize grain filling.
3. **Thermal Regime Trends:**
   - Mean annual temperature has increased at an estimated rate of $+0.21^\circ C$ per decade.
   - Heat stress days ($T_{\max} \ge 35^\circ C$) average **34 days/year**, concentrated in February, March, and April before the full onset of the monsoon.
4. **Soil Moisture Buffering:**
   - The surface $0–5\text{ cm}$ layer dries out within 3–4 rainless days, but the $0–100\text{ cm}$ root zone retains moisture for up to 14–18 days, highlighting the importance of deep-rooting varieties and conservation tillage.

---

## 4. Scientific Limitations & Uncertainty Disclaimers

> [!NOTE]
> **Data Scale vs. Farm Parcel Reality:**
> 1. **Coarse Scale Grid:** Atmospheric variables ($0.5^\circ$, ~50 km) and soil moisture ($9\text{ km}$) represent landscape averages. Local lowlands (inland valley swamps) retain substantially higher soil moisture than upland slopes.
> 2. **Cloud Gap Masking:** Landsat 30m optical passes suffer from tropical cloud cover during June–August (15.9% clear scene rate). Cloud-filtered Landsat composites must be paired with continuous GPM/POWER daily series.
> 3. **Model Validation:** Crop suitability scores model biophysical potential. Realized farm yields also depend on fertilizer application, seed variety (e.g., drought-tolerant *Omankwa* maize), and pest control.

