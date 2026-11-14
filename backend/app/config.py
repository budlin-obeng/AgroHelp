import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Root directory of the repository (parent of backend)
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "AgroHelp API"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Path to Space2Soil processed data
    DATA_PROCESSED_DIR: Path = ROOT_DIR / "Space2Soil" / "data" / "processed"
    CLIMATE_DATA_PATH: Path = DATA_PROCESSED_DIR / "climate" / "nasa_power_ejura_daily_clean.csv"
    CLIMATE_MONTHLY_PATH: Path = DATA_PROCESSED_DIR / "climate" / "nasa_power_ejura_monthly_clean.csv"
    RAINFALL_DATA_PATH: Path = DATA_PROCESSED_DIR / "rainfall" / "gpm_ejura_daily_clean.csv"
    RAINFALL_MONTHLY_PATH: Path = DATA_PROCESSED_DIR / "rainfall" / "gpm_ejura_monthly_clean.csv"
    SOIL_DATA_PATH: Path = DATA_PROCESSED_DIR / "soil_moisture" / "smap_ejura_daily_clean.csv"
    DROUGHT_EVENTS_PATH: Path = DATA_PROCESSED_DIR / "soil_moisture" / "smap_ejura_drought_events.csv"
    VEGETATION_DATA_PATH: Path = DATA_PROCESSED_DIR / "vegetation" / "landsat_ejura_monthly_vegetation.csv"
    
    # Model storage directory
    MODEL_DIR: Path = BACKEND_DIR / "app" / "ml" / "models"
    MODEL_FILE_JOBLIB: Path = MODEL_DIR / "crop_rotation_model.joblib"
    MODEL_FILE_PKL: Path = MODEL_DIR / "crop_rotation_model.pkl"
    SPACE2SOIL_MODEL_PATH: Path = ROOT_DIR / "Space2Soil" / "models" / "crop_rotation_model.joblib"
    
    # Pilot location defaults: Ejura Sekyedumasi, Ghana
    PILOT_LATITUDE: float = 7.3856
    PILOT_LONGITUDE: float = -1.3562
    PILOT_REGION: str = "Ejura-Sekyedumase, Ashanti Region, Ghana"
    PILOT_ECOLOGICAL_ZONE: str = "Forest-Savannah Transition"

settings = Settings()
