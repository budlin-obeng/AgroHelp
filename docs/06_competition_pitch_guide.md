# 06. NASA Space Apps Competition Pitch & Presentation Guide

**Challenge Track:** Field Shift: Adapting Farms with NASA Data  
**Project:** AgroHelp (by Space2Soil)  
**Pitch Time Limit:** 3 Minutes (180 Seconds)  
**Target Pilot:** Ejura-Sekyedumase, Ashanti Region, Ghana

---

## 1. 3-Minute Video Pitch Script

### [00:00 - 00:30] The Hook: The Maize Monoculture Trap
> *"In Ejura-Sekyedumase, the maize breadbasket of Ghana, over 88% of farmers are locked in continuous rain-fed maize monoculture. Season after season, continuous cereals provide an unbroken food supply for the devastating Fall Armyworm, while soil nutrients are bled dry. Farmers spend up to 45% of their hard-earned income on synthetic fertilizers, and when the minor season rains terminate early, entire harvests collapse.*  
> *Most space applications simply display raw satellite heatmaps that smallholders cannot act upon. Today, we introduce **AgroHelp**—a platform that transforms NASA Earth observations into actionable, explainable crop-rotation decision support."*

### [00:30 - 01:15] The Science & NASA Earth Observation Pipeline
> *"Our team, **Space2Soil**, acquired and validated a 10-year decadal baseline comprising 3,653 daily records from four distinct NASA observation streams:*  
> *1. **NASA POWER:** Capturing synoptic temperatures, heat stress days where temperatures exceed 35°C, and relative humidity.*  
> *2. **NASA GPM IMERG:** Tracking 14,088 mm of decadal rainfall and 126 extreme erosive storm periods.*  
> *3. **NASA SMAP:** Monitoring topsoil and root-zone soil moisture to catalog 557 severe agricultural drought anomalies.*  
> *4. **USGS/NASA Landsat 8 & 9:** Providing 30-meter analysis-ready NDVI rasters that monitor canopy cover across dry and wet seasons."*

### [01:15 - 02:15] The Live Demonstration: AgroHelp in Action
> *(Cut to screen recording of the AgroHelp dashboard)*  
> *"Meet Kwabena, a maize farmer in Babaso, Ejura. On the AgroHelp interactive map, he selects his farm parcel.*  
> *Instead of giving him an arbitrary suggestion, our **Machine Learning Crop-Rotation Engine** evaluates his farm size, soil type, and personal priorities using multi-objective regression:*  
> *- If he prioritizes **Fall Armyworm Disruption** and **Fertilizer Savings**, the model ranks the **Maize-Cowpea Biological Shield** first. Cowpea is a non-host dicot that starves Fall Armyworm larvae, while biological nitrogen fixation cuts his synthetic fertilizer bill by 35%.*  
> *- If his primary threat is **Late Minor Season Drought**, the engine recommends integrating **Cassava or Green Manures**, deep-rooting anchors that cushion against dry spells and buffer against destructive windstorms.*  
> *Every recommendation includes an explicit **Trade-Off Explorer**, transparently showing the financial, labor, and soil trade-offs."*

### [02:15 - 03:00] Impact & Judging Alignment
> *"AgroHelp satisfies core NASA Space Apps award criteria:*  
> *- **Best Use of Data:** Directly ingesting NASA POWER, GPM, SMAP, and Landsat into machine learning feature vectors.*  
> *- **Best Use of Science:** Grounded in FAO-56 soil water balance, Modified Fournier erosivity, and biological nitrogen fixation.*  
> *- **Local Impact:** Rooted in documented Ghana Ministry of Food and Agriculture district realities.*  
> *With 27 out of 27 automated tests passing, AgroHelp turns Earth observation from space into food security on the ground. Thank you."*

---

## 2. Recommended 7-Slide Pitch Deck Outline

1. **Slide 1: Title & Vision**
   - AgroHelp / Space2Soil logo, NASA Space Apps badges, tagline.
2. **Slide 2: The Problem in Ejura, Ghana**
   - 88% maize monoculture, Fall Armyworm cycle, synthetic fertilizer cost inflation, erratic rainfall.
3. **Slide 3: NASA Earth Observations across 4 Scales**
   - Table showing POWER (50 km), GPM (10 km), SMAP (9 km), Landsat (30 m).
4. **Slide 4: Machine Learning Decision Engine**
   - Diagram of feature vectors, MultiOutput GradientBoosting regressor, Pareto trade-off engine.
5. **Slide 5: Live UI Cockpit & Farmer Cards**
   - Screenshots of the React farmer dashboard, interactive map, and printable advisory cards.
6. **Slide 6: Validated Agronomic Results**
   - Scenario 1 (+15 kg N/ha, 35% fertilizer savings, 85% pest break) vs. Baseline monoculture.
7. **Slide 7: Team & Future Roadmap**
   - Team Space2Soil members, open-source repository link, and extension deployment plan.
