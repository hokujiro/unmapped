from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class OpportunityType(str, Enum):
    formal_employment = "formal_employment"
    self_employment = "self_employment"
    gig = "gig"
    training_pathway = "training_pathway"


class EducationLevel(str, Enum):
    no_formal = "no_formal"
    primary = "primary"
    lower_secondary = "lower_secondary"
    upper_secondary = "upper_secondary"
    post_secondary = "post_secondary"
    tertiary = "tertiary"


class DataSourceOverride(BaseModel):
    """
    Allows a government/operator to point UNMAPPED at their own data endpoint
    instead of the default public source (e.g. national census API vs ILOSTAT).
    """

    source_id: str = Field(
        description="Logical source name: 'ilostat', 'wdi', 'national_census', etc."
    )
    base_url: str | None = Field(
        default=None,
        description="Override base URL. If null, uses the default public endpoint.",
    )
    api_key_env_var: str | None = Field(
        default=None,
        description="Name of the environment variable that holds the API key.",
    )
    extra_params: dict[str, Any] = Field(
        default_factory=dict,
        description="Extra query parameters appended to every request to this source.",
    )


class AutomationCalibration(BaseModel):
    """
    LMIC-specific calibration for automation risk.
    The Frey-Osborne scores were built on US task composition data.
    In LMICs, infrastructure constraints and labour costs slow actual adoption.
    """

    lmic_discount_factor: float = Field(
        default=0.75,
        ge=0.0,
        le=1.5,
        description=(
            "Multiplier applied to raw Frey-Osborne score. "
            "< 1.0 = slower automation adoption (e.g. low-income Africa). "
            "> 1.0 = faster (e.g. export-manufacturing hubs)."
        ),
    )
    infrastructure_index: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="0–1 proxy for digital/physical infrastructure readiness (ITU broadband index).",
    )
    high_risk_sectors: list[str] = Field(
        default_factory=list,
        description="ISIC sector codes considered highest automation priority in this context.",
    )
    protected_sectors: list[str] = Field(
        default_factory=list,
        description="Sectors unlikely to automate (e.g. care, informal services).",
    )


class CountryConfig(BaseModel):
    """
    The complete configuration record a government or operator registers
    when connecting their country to UNMAPPED.
    """

    country_code: str = Field(
        description="ISO 3166-1 alpha-3 code (e.g. 'GHA', 'KEN', 'BGD')."
    )
    country_name: str
    region: str = Field(
        description="World Bank region (e.g. 'Sub-Saharan Africa', 'South Asia')."
    )
    language_code: str = Field(
        default="en",
        description="BCP-47 language tag for UI output (e.g. 'en', 'fr', 'sw', 'hi').",
    )
    currency_code: str = Field(default="USD", description="ISO 4217 currency code.")
    ilostat_country_code: str = Field(
        description="Country code as used by ILOSTAT (often same as ISO-3 but not always)."
    )
    wdi_country_code: str = Field(
        description="Country code as used by World Bank WDI API (ISO-2 or ISO-3)."
    )
    education_taxonomy: dict[str, str] = Field(
        default_factory=dict,
        description=(
            "Maps local credential names to standardised EducationLevel values. "
            "e.g. {'BECE': 'lower_secondary', 'WASSCE': 'upper_secondary'}"
        ),
    )
    enabled_opportunity_types: list[OpportunityType] = Field(
        default_factory=lambda: list(OpportunityType),
        description="Which opportunity categories to surface for this context.",
    )
    automation_calibration: AutomationCalibration = Field(
        default_factory=AutomationCalibration
    )
    data_source_overrides: list[DataSourceOverride] = Field(
        default_factory=list,
        description="Optional custom data endpoints that override public defaults.",
    )
    wittgenstein_scenario: str = Field(
        default="SSP2",
        description="Education projection scenario (SSP1–SSP5).",
    )
    notes: str | None = Field(
        default=None,
        description="Free-text notes from the operator (e.g. known data gaps).",
    )


class CountryConfigSummary(BaseModel):
    country_code: str
    country_name: str
    region: str
    language_code: str
    lmic_discount_factor: float
