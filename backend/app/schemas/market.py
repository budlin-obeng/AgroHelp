"""
Pydantic schemas for African Regional Produce & Market Intelligence.
Integrates FAOSTAT, FAO FPMA, and subnational agricultural market benchmarks.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ProduceItem(BaseModel):
    crop_name: str = Field(..., description="Common crop name")
    scientific_name: str = Field(..., description="Scientific botanical name")
    category: str = Field(..., description="Cereal, Legume / Pulse, Root & Tuber, Vegetable, Cash Crop")
    primary_produce: str = Field(..., description="Marketable form: e.g. Dry Grain, Fresh Tubers, Shelled Nuts")
    farmgate_price_local: float = Field(..., description="Typical farmgate price in local currency per unit")
    wholesale_price_local: float = Field(..., description="Wholesale market price in local currency per unit")
    currency: str = Field(..., description="Local currency code: GHS, NGN, XOF, KES, USD")
    unit: str = Field(..., description="Marketing unit: 100kg bag, 50kg bag, 100 tubers, metric tonne")
    price_per_tonne_local: float = Field(..., description="Normalized price per metric tonne in local currency")
    price_per_tonne_usd: float = Field(..., description="Normalized price per metric tonne in USD")
    peak_price_window: str = Field(..., description="Months with peak selling prices (lean season)")
    harvest_dip_window: str = Field(..., description="Months with lowest selling prices (harvest glut)")
    fao_national_yield_tonnes_ha: float = Field(..., description="FAOSTAT national average yield in tonnes/ha")
    potential_yield_tonnes_ha: float = Field(..., description="Attainable yield under resilient rotation in tonnes/ha")
    soil_fertility_impact: str = Field(..., description="Biological soil contribution, e.g. BNF nitrogen credit")
    faw_pest_break: str = Field(..., description="Fall Armyworm pest disruption status")
    market_liquidity: str = Field(..., description="Market liquidity rating: Very High, High, Medium")

class MarketHub(BaseModel):
    market_id: str = Field(..., description="Unique slug identifier: e.g. gh-ejura, ng-kano-dawanau")
    country: str = Field(..., description="Country name")
    country_code: str = Field(..., description="ISO 2-letter country code")
    sub_region: str = Field(..., description="Geographic administrative region / state / district")
    market_name: str = Field(..., description="Official market name")
    latitude: float = Field(..., description="GPS Latitude")
    longitude: float = Field(..., description="GPS Longitude")
    major_trading_days: str = Field(..., description="Weekly market days: e.g. Mondays, Daily, Wednesdays & Thursdays")
    catchment_description: str = Field(..., description="Summary of agricultural role and buyer catchment area")
    fao_market_code: Optional[str] = Field(default=None, description="FAO FPMA reporting code if registered")
    fao_reporting_center: bool = Field(default=False, description="Whether this hub is an active FAO food price monitoring center")
    produce_list: List[ProduceItem] = Field(default_factory=list, description="Crops and farm produce traded")

class MarketListResponse(BaseModel):
    total_countries: int
    total_markets: int
    countries: List[Dict[str, Any]]
    markets: List[MarketHub]

class MarketPriceCompareRequest(BaseModel):
    crop_names: Optional[List[str]] = Field(default=None, description="Optional filter of crop names")
    market_ids: Optional[List[str]] = Field(default=None, description="Market IDs to compare")

class MarketCompareItem(BaseModel):
    crop_name: str
    category: str
    market_id: str
    market_name: str
    country: str
    currency: str
    wholesale_price_local: float
    unit: str
    price_per_tonne_usd: float
    fao_yield_tonnes_ha: float

class MarketCompareResponse(BaseModel):
    crops_compared: List[str]
    markets_compared: List[str]
    comparisons: List[MarketCompareItem]
    usd_exchange_rates: Dict[str, float]
