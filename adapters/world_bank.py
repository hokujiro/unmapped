"""
World Bank WDI + Human Capital Index adapter.
Real HTTP calls to the World Bank public REST API (no auth required).
Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392
"""

from __future__ import annotations

import httpx

from core.cache import cache_get, cache_set

_WB_BASE = "https://api.worldbank.org/v2"

# Key indicators used by the analysis engine
INDICATORS = {
    "gdp_per_capita": "NY.GDP.PCAP.CD",
    "unemployment_rate": "SL.UEM.TOTL.ZS",
    "youth_unemployment": "SL.UEM.1524.ZS",
    "labor_force_participation": "SL.TLF.CACT.ZS",
    "secondary_enrollment": "SE.SEC.ENRR",
    "tertiary_enrollment": "SE.TER.ENRR",
    "human_capital_index": "HD.HCI.OVRL",
    "wage_workers_share": "SL.EMP.WORK.ZS",
    "self_employed_share": "SL.EMP.SELF.ZS",
    "internet_users_pct": "IT.NET.USER.ZS",
}


async def fetch_indicator(
    country_code: str,
    indicator_key: str,
    mrv: int = 5,
) -> list[dict]:
    """
    Fetch most-recent values for a WDI indicator.
    Returns list of {year, value} dicts, newest first.
    """
    indicator_id = INDICATORS.get(indicator_key, indicator_key)
    cache_key = f"wdi:{country_code}:{indicator_id}:{mrv}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    url = f"{_WB_BASE}/country/{country_code}/indicator/{indicator_id}"
    params = {"format": "json", "mrv": mrv, "per_page": mrv}

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    entries = data[1] if len(data) > 1 and data[1] else []
    result = [
        {"year": e["date"], "value": e["value"]}
        for e in entries
        if e.get("value") is not None
    ]
    result.sort(key=lambda x: x["year"], reverse=True)
    cache_set(cache_key, result, ttl_seconds=86400)
    return result


async def fetch_country_profile(country_code: str) -> dict:
    """Fetch a bundle of key indicators for a country in parallel."""
    import asyncio

    keys = [
        "gdp_per_capita",
        "unemployment_rate",
        "youth_unemployment",
        "human_capital_index",
        "secondary_enrollment",
        "internet_users_pct",
        "self_employed_share",
    ]
    results = await asyncio.gather(
        *[fetch_indicator(country_code, k) for k in keys],
        return_exceptions=True,
    )
    profile: dict = {}
    for key, result in zip(keys, results):
        if isinstance(result, Exception):
            profile[key] = None
        else:
            profile[key] = result[0]["value"] if result else None
    return profile


async def fetch_sector_employment(country_code: str) -> dict:
    """
    Returns employment share by broad sector (agriculture, industry, services).
    Uses WDI sector employment indicators.
    """
    sector_indicators = {
        "agriculture": "SL.AGR.EMPL.ZS",
        "industry": "SL.IND.EMPL.ZS",
        "services": "SL.SRV.EMPL.ZS",
    }
    result = {}
    async with httpx.AsyncClient(timeout=10.0) as client:
        for sector, ind_id in sector_indicators.items():
            cache_key = f"wdi:sector:{country_code}:{ind_id}"
            cached = cache_get(cache_key)
            if cached is not None:
                result[sector] = cached
                continue
            url = f"{_WB_BASE}/country/{country_code}/indicator/{ind_id}"
            try:
                resp = await client.get(url, params={"format": "json", "mrv": 3})
                resp.raise_for_status()
                data = resp.json()
                entries = data[1] if len(data) > 1 and data[1] else []
                values = [e["value"] for e in entries if e.get("value") is not None]
                val = values[0] if values else None
                result[sector] = val
                cache_set(cache_key, val, ttl_seconds=86400)
            except Exception:
                result[sector] = None
    return result
