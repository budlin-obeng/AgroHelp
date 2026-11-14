"""
AgroHelp FastAPI Application Entry Point.
Provides AI-driven crop rotation recommendations, multi-objective agronomic tradeoffs,
and decadal NASA Earth Observation environmental profiles for smallholder farmers.
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import router as api_router
from app.core.data_loader import data_loader
from app.ml.engine import ml_engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("agrohelp")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for data loading and ML model warming."""
    logger.info("Initializing AgroHelp Backend Services...")
    logger.info(f"Loaded {len(data_loader.climate_daily)} climate days, {len(data_loader.rainfall_daily)} rainfall days.")
    logger.info(f"ML Model active: {ml_engine.model_info.get('model_type')}")
    yield
    logger.info("AgroHelp Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description=(
        "Field Shift: Adapting Smallholder Farms with NASA Earth Observation Data. "
        "Provides ML-predicted crop rotation recommendations, Fall Armyworm disruption scoring, "
        "synthetic fertilizer savings, and decadal agroclimatological indicators for Ejura, Ghana."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under /api/v1, /api, and root / for maximum frontend flexibility
app.include_router(api_router, prefix=settings.API_V1_STR, tags=["AgroHelp v1"])
app.include_router(api_router, prefix="/api", tags=["AgroHelp API"])
app.include_router(api_router, tags=["AgroHelp Root"])

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to AgroHelp: NASA Earth Observation Crop Rotation & Agronomic Intelligence API",
        "pilot_region": settings.PILOT_REGION,
        "docs_url": "/docs",
        "version": settings.PROJECT_VERSION,
        "endpoints": [
            "/api/v1/predict-rotations",
            "/api/v1/tradeoffs",
            "/api/v1/environmental-profile",
            "/api/v1/pilot-data",
            "/api/v1/health",
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
