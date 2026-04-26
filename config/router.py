from fastapi import APIRouter, HTTPException

from config import store
from config.models import CountryConfig, CountryConfigSummary

router = APIRouter(prefix="/config", tags=["Configuration"])


@router.post(
    "/countries",
    response_model=CountryConfig,
    status_code=201,
    summary="Register or update a country configuration",
    description=(
        "Operators (governments, NGOs) call this endpoint to connect their country's "
        "data sources and calibration parameters to UNMAPPED. Once registered, all "
        "analysis endpoints use this configuration automatically."
    ),
)
def upsert_country(config: CountryConfig) -> CountryConfig:
    return store.upsert(config)


@router.get(
    "/countries",
    response_model=list[CountryConfigSummary],
    summary="List all configured countries",
)
def list_countries() -> list[CountryConfigSummary]:
    return [
        CountryConfigSummary(
            country_code=c.country_code,
            country_name=c.country_name,
            region=c.region,
            language_code=c.language_code,
            lmic_discount_factor=c.automation_calibration.lmic_discount_factor,
        )
        for c in store.list_all()
    ]


@router.get(
    "/countries/{country_code}",
    response_model=CountryConfig,
    summary="Get full configuration for a country",
)
def get_country(country_code: str) -> CountryConfig:
    config = store.get(country_code)
    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"No configuration found for '{country_code.upper()}'. "
                   "Use POST /config/countries to register it.",
        )
    return config


@router.delete(
    "/countries/{country_code}",
    status_code=204,
    summary="Remove a country configuration",
)
def delete_country(country_code: str) -> None:
    if not store.delete(country_code):
        raise HTTPException(status_code=404, detail=f"Country '{country_code}' not found.")
