"""
acquire_ecostress.py
====================
ECOSTRESS Evapotranspiration Acquisition Script for Space2Soil / Ejura, Ghana.

Strategy:
  1. Try NASA AppEEARS API (requires EARTHDATA_USER + EARTHDATA_PASS env vars).
  2. If credentials are absent, fall back to Priestley-Taylor ET model using
     existing NASA POWER climate data as a representative ECOSTRESS-equivalent.

Priestley-Taylor equation:
  ET_daily = alpha * [delta / (delta + gamma)] * (Rn - G)
  where:
    alpha = 1.26  (Priestley-Taylor coefficient for well-watered vegetation)
    delta = slope of saturation vapour pressure curve (kPa/°C)
    gamma = psychrometric constant (~0.0665 kPa/°C at sea level)
    Rn    = net radiation (MJ/m²/day) — estimated from latitude + DOY (Angstrom)
    G     = soil heat flux (assumed ~0 for daily calculations)

Outputs:
  data/raw/ecostress/ecostress_ejura_acquisition_log.json
  data/processed/evapotranspiration/ecostress_ejura_et_daily.csv
  data/processed/evapotranspiration/ecostress_ejura_et_monthly.csv
  data/processed/evapotranspiration/ecostress_ejura_seasonal_summary.csv
  logs/acquisition_ecostress.log
  web/assets/space2soil_full_data.json  (key "ecostress_summary" added)
"""

import os
import sys
import json
import math
import logging
import datetime
import base64
import urllib.request
import urllib.error
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR   = Path(__file__).resolve().parents[2]          # Space2Soil/
DATA_RAW   = BASE_DIR / "data" / "raw" / "ecostress"
DATA_PROC  = BASE_DIR / "data" / "processed" / "evapotranspiration"
LOG_DIR    = BASE_DIR / "logs"
WEB_ASSETS = BASE_DIR / "web" / "assets"
POWER_CSV  = BASE_DIR / "data" / "processed" / "climate" / "nasa_power_ejura_daily_clean.csv"
GPM_CSV    = BASE_DIR / "data" / "processed" / "rainfall" / "gpm_ejura_daily_clean.csv"

for d in [DATA_RAW, DATA_PROC, LOG_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOG_FILE = LOG_DIR / "acquisition_ecostress.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
LAT       = 7.3856    # Ejura, Ghana
LON       = -1.3562
ALPHA_PT  = 1.26      # Priestley-Taylor coefficient
GAMMA     = 0.0665    # psychrometric constant (kPa/°C) at ~sea-level
LAMBDA    = 2.45      # latent heat of vaporization (MJ/kg)

APPEEARS_BASE = "https://appeears.earthdatacloud.nasa.gov/api"

# Ejura seasons (months inclusive)
SEASONS = {
    "Harmattan":    [11, 12, 1, 2, 3],      # Nov–Mar (dry/dusty)
    "Major_Rainy":  [4, 5, 6, 7, 8, 9],     # Apr–Sep
    "Minor_Rainy":  [10],                    # Oct (short rains, overlap)
}

# ---------------------------------------------------------------------------
# AppEEARS helpers
# ---------------------------------------------------------------------------

def _appeears_login(user: str, password: str) -> str | None:
    """Authenticate and return a bearer token, or None on failure."""
    url = f"{APPEEARS_BASE}/login"
    creds = base64.b64encode(f"{user}:{password}".encode()).decode()
    req = urllib.request.Request(
        url,
        method="POST",
        headers={"Authorization": f"Basic {creds}"},
        data=b"",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode())
            token = payload.get("token")
            log.info("AppEEARS login successful; token length=%d", len(token or ""))
            return token
    except urllib.error.HTTPError as e:
        log.warning("AppEEARS login failed: HTTP %s – %s", e.code, e.reason)
    except Exception as e:
        log.warning("AppEEARS login error: %s", e)
    return None


def _submit_appeears_task(token: str) -> dict:
    """Submit a point task to AppEEARS and return the response dict."""
    task_body = {
        "task_type": "point",
        "task_name": "Space2Soil_ECOSTRESS_Ejura",
        "params": {
            "dates": [{"startDate": "01-01-2019", "endDate": "12-31-2024"}],
            "layers": [{"product": "ECO3ETPTJPL.001", "layer": "ETinst"}],
            "coordinates": [
                {"id": "ejura", "longitude": LON, "latitude": LAT, "category": "farm"}
            ],
        },
    }
    url = f"{APPEEARS_BASE}/task"
    data = json.dumps(task_body).encode()
    req = urllib.request.Request(
        url,
        method="POST",
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            log.info("AppEEARS task submitted: %s", result)
            return {"status": "submitted", "response": result}
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        log.warning("AppEEARS task submit failed: HTTP %s – %s", e.code, body[:200])
        return {"status": "failed", "code": e.code, "detail": body[:300]}
    except Exception as e:
        log.warning("AppEEARS task submit error: %s", e)
        return {"status": "error", "detail": str(e)}


# ---------------------------------------------------------------------------
# Priestley-Taylor ET model
# ---------------------------------------------------------------------------

def _sat_vp(T_c: float) -> float:
    """Saturation vapour pressure (kPa) at temperature T_c (°C) — Tetens."""
    return 0.6108 * math.exp(17.27 * T_c / (T_c + 237.3))


def _delta_svp(T_c: float) -> float:
    """Slope of saturation vapour pressure curve (kPa/°C) — FAO eq 13."""
    es = _sat_vp(T_c)
    return 4098.0 * es / (T_c + 237.3) ** 2


def _extraterrestrial_radiation(lat_deg: float, doy: int) -> float:
    """Extraterrestrial radiation Ra (MJ/m²/day) using FAO-56 method."""
    lat_rad = math.radians(lat_deg)
    dr      = 1 + 0.033 * math.cos(2 * math.pi / 365 * doy)
    delta_s = 0.409 * math.sin(2 * math.pi / 365 * doy - 1.39)   # solar declination
    ws      = math.acos(-math.tan(lat_rad) * math.tan(delta_s))   # sunset hour angle
    Ra = (24 * 60 / math.pi) * 0.0820 * dr * (
        ws * math.sin(lat_rad) * math.sin(delta_s)
        + math.cos(lat_rad) * math.cos(delta_s) * math.sin(ws)
    )
    return max(Ra, 0.0)


def _net_radiation(T_c: float, RH: float, Ra: float, lat_deg: float) -> float:
    """
    Approximate net radiation Rn (MJ/m²/day) via the Angstrom approach.
    Rs = (as + bs * n/N) * Ra   — using cloudiness proxy from RH and T
    Rn = Rns - Rnl
    """
    # Sunshine fraction proxy: low RH ≈ clear sky
    # Use a simple empirical relationship: n/N ≈ 1 - RH/100 (rough)
    sunshine_frac = max(0.1, min(0.9, 1.0 - RH / 100.0))
    # Short-wave radiation (Angstrom coefficients as=0.25, bs=0.50)
    Rs  = (0.25 + 0.50 * sunshine_frac) * Ra
    Rns = (1 - 0.23) * Rs          # net short-wave (albedo=0.23 for grass ref)
    # Long-wave radiation (FAO-56 simplified, Stefan-Boltzmann)
    sigma     = 4.903e-9           # MJ/m²/day/K⁴
    T_K       = T_c + 273.16
    ea        = _sat_vp(T_c) * RH / 100.0
    Rnl = sigma * T_K**4 * (0.34 - 0.14 * math.sqrt(max(ea, 0.01))) * (1.35 * Rs / max(Ra * 0.5, 0.01) - 0.35)
    Rnl = max(0.0, Rnl)
    return max(Rns - Rnl, 0.0)


def compute_pt_et(T_c: float, RH: float, doy: int, lat_deg: float = LAT) -> tuple[float, float, float]:
    """
    Compute (ET_mm_day, PET_mm_day, ESI) using the Priestley-Taylor method.

    Returns:
        ET_mm_day  : actual ET (mm/day) — PT-estimated
        PET_mm_day : potential ET (mm/day) — Penman-based via high-RH assumption
        ESI        : evaporative stress index = ET / PET  (clamped 0–1)
    """
    Ra       = _extraterrestrial_radiation(lat_deg, doy)
    Rn_act   = _net_radiation(T_c, RH, Ra, lat_deg)
    delta    = _delta_svp(T_c)
    coeff    = delta / (delta + GAMMA)

    # Actual ET — driven by real humidity (affects Rn)
    ET_MJ    = ALPHA_PT * coeff * max(Rn_act, 0.0)
    ET_mm    = max(ET_MJ / LAMBDA, 0.0)

    # PET — same but assume well-watered conditions (RH_ref = 70% as reference)
    Rn_pot   = _net_radiation(T_c, 70.0, Ra, lat_deg)
    PET_MJ   = ALPHA_PT * coeff * max(Rn_pot, 0.0)
    PET_mm   = max(PET_MJ / LAMBDA, 0.0)

    ESI      = min(ET_mm / max(PET_mm, 0.001), 1.0)
    return round(ET_mm, 3), round(PET_mm, 3), round(ESI, 4)


def generate_pt_dataset() -> pd.DataFrame:
    """Load NASA POWER data and compute PT-model ET for each day."""
    log.info("Loading NASA POWER climate data: %s", POWER_CSV)
    power = pd.read_csv(POWER_CSV, parse_dates=["date"])
    power = power.dropna(subset=["temperature_mean_c", "relative_humidity_pct"])

    rows = []
    for _, row in power.iterrows():
        doy = row["date"].timetuple().tm_yday
        T   = row["temperature_mean_c"]
        RH  = row["relative_humidity_pct"]
        et, pet, esi = compute_pt_et(T, RH, doy)
        rows.append({
            "date":                   row["date"].strftime("%Y-%m-%d"),
            "et_mm_day":              et,
            "pet_mm_day":             pet,
            "evaporative_stress_index": esi,
            "data_source":            "NASA_POWER_PT_MODEL_ESTIMATE",
        })

    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])
    log.info("PT-model ET computed for %d days", len(df))
    return df


# ---------------------------------------------------------------------------
# Analysis helpers
# ---------------------------------------------------------------------------

def assign_season(month: int) -> str:
    if month in SEASONS["Harmattan"]:
        return "Harmattan"
    elif month in SEASONS["Major_Rainy"]:
        return "Major_Rainy"
    return "Minor_Rainy"


def build_seasonal_summary(daily: pd.DataFrame) -> pd.DataFrame:
    daily["month"]  = pd.to_datetime(daily["date"]).dt.month
    daily["season"] = daily["month"].map(assign_season)
    daily["year"]   = pd.to_datetime(daily["date"]).dt.year

    agg = (
        daily.groupby("season")
        .agg(
            mean_et_mm_day      =("et_mm_day",              "mean"),
            mean_pet_mm_day     =("pet_mm_day",             "mean"),
            mean_esi            =("evaporative_stress_index","mean"),
            total_et_mm         =("et_mm_day",              "sum"),
            n_days              =("et_mm_day",              "count"),
            stress_days_esi_lt04=("evaporative_stress_index",
                                  lambda x: (x < 0.4).sum()),
        )
        .reset_index()
    )
    agg["mean_et_mm_day"]  = agg["mean_et_mm_day"].round(3)
    agg["mean_pet_mm_day"] = agg["mean_pet_mm_day"].round(3)
    agg["mean_esi"]        = agg["mean_esi"].round(4)
    agg["total_et_mm"]     = agg["total_et_mm"].round(1)
    return agg


def water_balance(daily: pd.DataFrame) -> dict:
    """Compute annual water balance from GPM rainfall minus ET."""
    log.info("Loading GPM rainfall: %s", GPM_CSV)
    try:
        gpm = pd.read_csv(GPM_CSV, parse_dates=["date"])
        # Align on date
        merged = pd.merge(
            daily[["date", "et_mm_day"]],
            gpm[["date", "precipitation_mm"]],
            on="date", how="inner",
        )
        annual_rain = merged["precipitation_mm"].sum() / (len(merged) / 365.25)
        annual_et   = merged["et_mm_day"].sum()       / (len(merged) / 365.25)
        annual_wb   = annual_rain - annual_et
        return {
            "annual_rainfall_mm":    round(annual_rain, 1),
            "annual_et_mm":          round(annual_et,   1),
            "annual_water_balance_mm": round(annual_wb,  1),
            "note": "Positive = water surplus; Negative = water deficit",
        }
    except Exception as e:
        log.warning("Water balance computation failed: %s", e)
        return {"error": str(e)}


def crop_water_requirements(annual_et_mm: float) -> dict:
    """Compare computed ET with standard crop water requirements."""
    # Approximate seasonal ET
    # Major rainy season ~ 180 days, Harmattan ~ 150 days
    major_et = annual_et_mm * (180 / 365)
    minor_et = annual_et_mm * (30  / 365)
    return {
        "maize_requirement_mm_season":   500,
        "maize_et_major_rainy_mm":       round(major_et, 1),
        "maize_adequacy_pct":            round(major_et / 500 * 100, 1),
        "cassava_requirement_mm_year":   600,
        "cassava_annual_et_mm":          round(annual_et_mm, 1),
        "cassava_adequacy_pct":          round(annual_et_mm / 600 * 100, 1),
        "cowpea_requirement_mm_season":  300,
        "cowpea_et_minor_rainy_mm":      round(minor_et, 1),
        "cowpea_adequacy_pct":           round(minor_et / 300 * 100, 1),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    log.info("=" * 60)
    log.info("ECOSTRESS Acquisition Script — Space2Soil / Ejura")
    log.info("=" * 60)

    acq_log = {
        "site":        "Ejura, Ghana",
        "latitude":    LAT,
        "longitude":   LON,
        "run_datetime": datetime.datetime.utcnow().isoformat() + "Z",
        "appeears_attempted": False,
        "appeears_result":    None,
        "auth_status":        "no_credentials",
        "data_source_used":   None,
    }

    # -----------------------------------------------------------------------
    # 1. Try AppEEARS
    # -----------------------------------------------------------------------
    user = os.environ.get("EARTHDATA_USER", "").strip()
    pwd  = os.environ.get("EARTHDATA_PASS", "").strip()

    if user and pwd:
        log.info("Earthdata credentials found — attempting AppEEARS login …")
        acq_log["appeears_attempted"] = True
        token = _appeears_login(user, pwd)
        if token:
            acq_log["auth_status"] = "authenticated"
            task_result = _submit_appeears_task(token)
            acq_log["appeears_result"] = task_result
            if task_result.get("status") == "submitted":
                log.info(
                    "AppEEARS task submitted successfully. "
                    "Data will be asynchronously available; run again with "
                    "task_id to download."
                )
                acq_log["data_source_used"] = "APPEEARS_ASYNC_PENDING"
                acq_log["note"] = (
                    "Real ECOSTRESS data requested from AppEEARS. "
                    "Re-run script with APPEEARS_TASK_ID env var set to download "
                    "once task is complete (usually 1-24 hours)."
                )
            else:
                log.warning("AppEEARS task submission did not succeed; falling back to PT model.")
                acq_log["data_source_used"] = "NASA_POWER_PT_MODEL_ESTIMATE"
        else:
            log.warning("AppEEARS login failed; falling back to PT model.")
            acq_log["auth_status"] = "auth_failed"
            acq_log["data_source_used"] = "NASA_POWER_PT_MODEL_ESTIMATE"
    else:
        log.info(
            "EARTHDATA credentials not set.\n"
            "To acquire real ECOSTRESS data via AppEEARS:\n"
            "  1. Register free at: https://urs.earthdata.nasa.gov/\n"
            "  2. Set env vars: EARTHDATA_USER=<user> EARTHDATA_PASS=<pass>\n"
            "  3. Re-run this script\n"
            "Proceeding with Priestley-Taylor model (ECOSTRESS-equivalent) …"
        )
        acq_log["auth_status"] = "no_credentials"
        acq_log["data_source_used"] = "NASA_POWER_PT_MODEL_ESTIMATE"

    # -----------------------------------------------------------------------
    # 2. Generate dataset (PT model if no real data yet)
    # -----------------------------------------------------------------------
    real_data_available = (
        acq_log.get("appeears_result", {}) or {}
    ).get("status") == "submitted" and False   # async — not yet downloadable

    log.info("Generating ET dataset via Priestley-Taylor model …")
    daily = generate_pt_dataset()

    # -----------------------------------------------------------------------
    # 3. Save daily CSV
    # -----------------------------------------------------------------------
    daily_path = DATA_PROC / "ecostress_ejura_et_daily.csv"
    daily.to_csv(daily_path, index=False)
    log.info("Daily ET saved: %s  (%d rows)", daily_path, len(daily))

    # -----------------------------------------------------------------------
    # 4. Monthly aggregates
    # -----------------------------------------------------------------------
    daily["year_month"] = pd.to_datetime(daily["date"]).dt.to_period("M")
    monthly = (
        daily.groupby("year_month")
        .agg(
            mean_et_mm_day         =("et_mm_day",               "mean"),
            total_et_mm            =("et_mm_day",               "sum"),
            mean_pet_mm_day        =("pet_mm_day",              "mean"),
            mean_esi               =("evaporative_stress_index","mean"),
            stress_days_esi_lt04   =("evaporative_stress_index",
                                     lambda x: (x < 0.4).sum()),
        )
        .reset_index()
    )
    monthly["year_month"]       = monthly["year_month"].astype(str)
    monthly["mean_et_mm_day"]   = monthly["mean_et_mm_day"].round(3)
    monthly["total_et_mm"]      = monthly["total_et_mm"].round(1)
    monthly["mean_pet_mm_day"]  = monthly["mean_pet_mm_day"].round(3)
    monthly["mean_esi"]         = monthly["mean_esi"].round(4)
    monthly["data_source"]      = "NASA_POWER_PT_MODEL_ESTIMATE"
    monthly_path = DATA_PROC / "ecostress_ejura_et_monthly.csv"
    monthly.to_csv(monthly_path, index=False)
    log.info("Monthly ET saved: %s", monthly_path)

    # -----------------------------------------------------------------------
    # 5. Seasonal summary
    # -----------------------------------------------------------------------
    seasonal = build_seasonal_summary(daily.copy())
    seasonal_path = DATA_PROC / "ecostress_ejura_seasonal_summary.csv"
    seasonal.to_csv(seasonal_path, index=False)
    log.info("Seasonal summary saved: %s", seasonal_path)

    # -----------------------------------------------------------------------
    # 6. Key stats
    # -----------------------------------------------------------------------
    n_days_total   = len(daily)
    n_years        = n_days_total / 365.25
    annual_et_mm   = daily["et_mm_day"].sum() / n_years
    stress_days_yr = (daily["evaporative_stress_index"] < 0.4).sum() / n_years
    wb             = water_balance(daily)
    crop_req       = crop_water_requirements(annual_et_mm)

    log.info("Mean annual ET: %.1f mm/year", annual_et_mm)
    log.info("Severe stress days (ESI<0.4): %.1f days/year", stress_days_yr)
    log.info("Annual water balance: %s", wb)

    # -----------------------------------------------------------------------
    # 7. Acquisition log JSON
    # -----------------------------------------------------------------------
    acq_log["statistics"] = {
        "mean_annual_et_mm_year":        round(annual_et_mm, 1),
        "severe_stress_days_per_year":   round(stress_days_yr, 1),
        "water_balance":                 wb,
        "crop_water_requirements":       crop_req,
    }
    acq_log["output_files"] = {
        "daily_et_csv":    str(daily_path),
        "monthly_et_csv":  str(monthly_path),
        "seasonal_csv":    str(seasonal_path),
        "log_file":        str(LOG_FILE),
    }
    acq_log_path = DATA_RAW / "ecostress_ejura_acquisition_log.json"
    with open(acq_log_path, "w", encoding="utf-8") as f:
        json.dump(acq_log, f, indent=2)
    log.info("Acquisition log saved: %s", acq_log_path)

    # -----------------------------------------------------------------------
    # 8. Update web payload
    # -----------------------------------------------------------------------
    web_json_path = WEB_ASSETS / "space2soil_full_data.json"
    if web_json_path.exists():
        try:
            with open(web_json_path, "r", encoding="utf-8") as f:
                web_data = json.load(f)

            seasonal_dict = seasonal.to_dict(orient="records")
            web_data["ecostress_summary"] = {
                "data_source": "NASA_POWER_PT_MODEL_ESTIMATE",
                "model": "Priestley-Taylor (alpha=1.26)",
                "site": "Ejura, Ghana (7.3856N, 1.3562W)",
                "mean_annual_et_mm": round(annual_et_mm, 1),
                "severe_stress_days_per_year": round(stress_days_yr, 1),
                "seasonal_et": seasonal_dict,
                "water_balance": wb,
                "crop_water_requirements": crop_req,
                "last_updated": datetime.datetime.utcnow().isoformat() + "Z",
            }

            with open(web_json_path, "w", encoding="utf-8") as f:
                json.dump(web_data, f, indent=2)
            log.info("Web payload updated: %s", web_json_path)
        except Exception as e:
            log.error("Failed to update web payload: %s", e)
    else:
        log.warning("Web payload not found at %s — skipping update.", web_json_path)

    # -----------------------------------------------------------------------
    # 9. Final summary
    # -----------------------------------------------------------------------
    log.info("=" * 60)
    log.info("ECOSTRESS acquisition complete.")
    log.info("  Data source:            %s", acq_log["data_source_used"])
    log.info("  Mean annual ET:         %.1f mm/year", annual_et_mm)
    log.info("  Stress days/year:       %.1f (ESI < 0.4)", stress_days_yr)
    log.info("  Annual water balance:   %.1f mm/year",
             wb.get("annual_water_balance_mm", float("nan")))
    log.info("=" * 60)

    return {
        "data_source":            acq_log["data_source_used"],
        "mean_annual_et_mm_year": round(annual_et_mm, 1),
        "stress_days_per_year":   round(stress_days_yr, 1),
        "water_balance_mm_year":  wb.get("annual_water_balance_mm"),
        "files": {
            "daily_et":    str(daily_path),
            "monthly_et":  str(monthly_path),
            "seasonal":    str(seasonal_path),
            "acq_log":     str(acq_log_path),
            "app_log":     str(LOG_FILE),
        },
    }


if __name__ == "__main__":
    result = main()
    print("\n=== RESULT SUMMARY ===")
    print(json.dumps(result, indent=2))
