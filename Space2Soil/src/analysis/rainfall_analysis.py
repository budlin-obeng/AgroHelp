"""
Phase 3: Scientific Rainfall Seasonality, Dry Spell & Erosivity Analysis for Space2Soil
Pilot Location: Ejura, Ashanti Region, Ghana (Lat: 7.3856, Lon: -1.3562)
"""

import os
import sys
import json
import logging
import pandas as pd
import numpy as np

# Setup logging
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "analysis_rainfall.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def detect_season_onset_cessation(df_year, year):
    """
    Detects agricultural season onset and cessation for Ghana transition zone.
    Major Season Onset: First day after March 1 with >= 20mm over 3 days, 
    with no dry spell > 7 days in the next 21 days.
    """
    df_year = df_year.sort_values("date").reset_index(drop=True)
    df_year["doy"] = pd.to_datetime(df_year["date"]).dt.dayofyear
    
    # March 1 is DOY ~60
    march_1_doy = pd.to_datetime(f"{year}-03-01").dayofyear
    nov_30_doy = pd.to_datetime(f"{year}-11-30").dayofyear
    
    major_onset_date = None
    major_onset_doy = None
    
    precip = df_year["precipitation_mm"].values
    n = len(precip)
    
    for i in range(n - 25):
        doy = df_year.loc[i, "doy"]
        if doy >= march_1_doy and doy <= march_1_doy + 75:  # March to mid-May
            # Check 3-day sum >= 20mm
            three_day_sum = precip[i:i+3].sum()
            if three_day_sum >= 20.0:
                # Check next 21 days for dry spells > 7 consecutive days
                next_21 = precip[i+3:i+24]
                # Calculate max consecutive zeros
                max_consec_dry = 0
                curr_dry = 0
                for p in next_21:
                    if p < 1.0:
                        curr_dry += 1
                        max_consec_dry = max(max_consec_dry, curr_dry)
                    else:
                        curr_dry = 0
                
                if max_consec_dry <= 7:
                    major_onset_date = df_year.loc[i, "date"]
                    major_onset_doy = doy
                    break
                    
    # Fallback if strict criteria not met
    if major_onset_date is None:
        # First 3-day rainfall >= 25mm after March 1
        for i in range(n - 3):
            doy = df_year.loc[i, "doy"]
            if doy >= march_1_doy and precip[i:i+3].sum() >= 25.0:
                major_onset_date = df_year.loc[i, "date"]
                major_onset_doy = doy
                break

    # Cessation: Last date before Nov 30 with cumulative rainfall ending
    cessation_date = None
    cessation_doy = None
    for i in range(n - 1, 0, -1):
        doy = df_year.loc[i, "doy"]
        if doy <= nov_30_doy:
            if precip[i] >= 5.0 or precip[max(0, i-2):i+1].sum() >= 15.0:
                cessation_date = df_year.loc[i, "date"]
                cessation_doy = doy
                break

    lgp_days = (cessation_doy - major_onset_doy) if (cessation_doy and major_onset_doy) else None
    
    return {
        "year": year,
        "major_season_onset_date": major_onset_date,
        "major_season_onset_doy": major_onset_doy,
        "season_cessation_date": cessation_date,
        "season_cessation_doy": cessation_doy,
        "length_of_growing_period_days": lgp_days,
        "total_annual_rainfall_mm": round(float(precip.sum()), 2)
    }

def analyze_dry_spells(df):
    """
    Identifies dry spells during the active growing cycle (March 15 to November 15).
    """
    df["dt"] = pd.to_datetime(df["date"])
    df["doy"] = df["dt"].dt.dayofyear
    
    # Filter growing season
    df_grow = df[(df["dt"].dt.month >= 3) & (df["dt"].dt.month <= 11)].copy()
    df_grow = df_grow.sort_values("date").reset_index(drop=True)
    
    dry_spells = []
    current_spell_start = None
    current_spell_len = 0
    
    for idx, row in df_grow.iterrows():
        if row["precipitation_mm"] < 1.0:
            if current_spell_len == 0:
                current_spell_start = row["date"]
            current_spell_len += 1
        else:
            if current_spell_len >= 5: # Relevant dry spell >= 5 consecutive days
                end_date = df_grow.loc[idx - 1, "date"]
                # Categorize severity
                if current_spell_len >= 14:
                    sev = "Severe_Drought_Risk"
                elif current_spell_len >= 8:
                    sev = "Moderate_Moisture_Stress"
                else:
                    sev = "Mild_Dry_Spell"
                    
                dry_spells.append({
                    "start_date": current_spell_start,
                    "end_date": end_date,
                    "duration_days": current_spell_len,
                    "severity": sev,
                    "year": int(current_spell_start[:4]),
                    "month": int(current_spell_start[5:7])
                })
            current_spell_len = 0
            
    return pd.DataFrame(dry_spells)

def run_rainfall_scientific_analysis(base_dir):
    clean_csv = os.path.join(base_dir, "data", "processed", "rainfall", "gpm_ejura_daily_clean.csv")
    out_dir = os.path.join(base_dir, "data", "processed", "analysis")
    os.makedirs(out_dir, exist_ok=True)

    logging.info(f"Loading cleaned daily precipitation from {clean_csv}")
    df = pd.read_csv(clean_csv)
    df["year"] = pd.to_datetime(df["date"]).dt.year

    # 1. Decadal Seasonality Metrics (Onset, Cessation, LGP)
    years = sorted(df["year"].unique())
    season_metrics = []
    for y in years:
        df_y = df[df["year"] == y]
        m = detect_season_onset_cessation(df_y, y)
        season_metrics.append(m)

    df_seasons = pd.DataFrame(season_metrics)
    seasons_csv = os.path.join(out_dir, "rainfall_seasonality_metrics.csv")
    df_seasons.to_csv(seasons_csv, index=False)
    logging.info(f"Saved rainfall seasonality metrics to {seasons_csv}")

    # 2. Dry Spell Analysis
    df_spells = analyze_dry_spells(df)
    spells_csv = os.path.join(out_dir, "dry_spell_events.csv")
    df_spells.to_csv(spells_csv, index=False)
    logging.info(f"Saved dry spell events ({len(df_spells)} events) to {spells_csv}")

    # 3. Rainfall Erosivity Estimation (Modified Fournier Index MFI)
    # MFI = sum(p_i^2) / P_total
    df["year_month"] = pd.to_datetime(df["date"]).dt.to_period("M").astype(str)
    monthly_sums = df.groupby(["year", "year_month"])["precipitation_mm"].sum().reset_index()
    
    mfi_per_year = []
    for y in years:
        m_sums = monthly_sums[monthly_sums["year"] == y]["precipitation_mm"].values
        annual_p = m_sums.sum()
        mfi = (np.sum(m_sums ** 2) / annual_p) if annual_p > 0 else 0
        # FAO / Arnoldus Erosivity R approx: R = 0.264 * MFI^1.5
        r_factor = 0.264 * (mfi ** 1.5)
        mfi_per_year.append({
            "year": y,
            "modified_fournier_index": round(float(mfi), 2),
            "estimated_rusle_r_factor": round(float(r_factor), 2),
            "erosion_risk_class": "Very_High" if mfi > 160 else ("High" if mfi > 120 else "Moderate")
        })

    df_erosivity = pd.DataFrame(mfi_per_year)
    erosivity_csv = os.path.join(out_dir, "rainfall_erosivity_index.csv")
    df_erosivity.to_csv(erosivity_csv, index=False)
    logging.info(f"Saved rainfall erosivity indices to {erosivity_csv}")

    return seasons_csv, spells_csv, erosivity_csv

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    run_rainfall_scientific_analysis(base_dir)

