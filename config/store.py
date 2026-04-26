"""
In-memory config store with two pre-seeded country configurations.
Swap this module for a database-backed implementation without touching any other code.
"""

from __future__ import annotations

from config.models import AutomationCalibration, CountryConfig, OpportunityType

_configs: dict[str, CountryConfig] = {}


def get(country_code: str) -> CountryConfig | None:
    return _configs.get(country_code.upper())


def upsert(config: CountryConfig) -> CountryConfig:
    _configs[config.country_code.upper()] = config
    return config


def delete(country_code: str) -> bool:
    return _configs.pop(country_code.upper(), None) is not None


def list_all() -> list[CountryConfig]:
    return list(_configs.values())


# ── Seed two reference configurations ─────────────────────────────────────────

_configs["GHA"] = CountryConfig(
    country_code="GHA",
    country_name="Ghana",
    region="Sub-Saharan Africa",
    language_code="en",
    currency_code="GHS",
    ilostat_country_code="GHA",
    wdi_country_code="GH",
    education_taxonomy={
        "BECE": "lower_secondary",
        "WASSCE": "upper_secondary",
        "HND": "post_secondary",
        "BSc": "tertiary",
    },
    enabled_opportunity_types=[
        OpportunityType.formal_employment,
        OpportunityType.self_employment,
        OpportunityType.gig,
        OpportunityType.training_pathway,
    ],
    automation_calibration=AutomationCalibration(
        lmic_discount_factor=0.68,
        infrastructure_index=0.38,
        high_risk_sectors=["C", "G"],   # Manufacturing, Trade
        protected_sectors=["Q", "P"],   # Health, Education
    ),
    wittgenstein_scenario="SSP2",
    notes="Urban-informal economy context. Significant mobile-money sector. ITU broadband ~45%.",
)

_configs["BGD"] = CountryConfig(
    country_code="BGD",
    country_name="Bangladesh",
    region="South Asia",
    language_code="bn",
    currency_code="BDT",
    ilostat_country_code="BGD",
    wdi_country_code="BD",
    education_taxonomy={
        "JSC": "lower_secondary",
        "SSC": "upper_secondary",
        "HSC": "post_secondary",
    },
    enabled_opportunity_types=[
        OpportunityType.formal_employment,
        OpportunityType.self_employment,
        OpportunityType.training_pathway,
    ],
    automation_calibration=AutomationCalibration(
        lmic_discount_factor=0.82,
        infrastructure_index=0.44,
        high_risk_sectors=["C"],         # Manufacturing (RMG sector)
        protected_sectors=["A", "Q"],    # Agriculture, Health
    ),
    wittgenstein_scenario="SSP2",
    notes="Rural agricultural + export-garment dual economy. Mobile internet ~60%.",
)
