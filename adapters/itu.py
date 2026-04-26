"""
ITU DataHub — digital access indicators.
https://datahub.itu.int/

Used to calibrate near-term AI displacement feasibility:
  "This occupation is exposed in principle" ≠ "automatable soon in this context"

Key indicators:
  - Mobile broadband subscriptions per 100 inhabitants
  - Individuals using the internet (%)
  - Households with internet access (%)

Fallback to World Bank WDI IT.NET.USER.ZS when ITU is unavailable.
"""

from __future__ import annotations

import httpx

from core.cache import cache_get, cache_set

# Embedded ITU digital access scores (mobile broadband per 100 + internet %)
# Source: ITU DataHub 2023 data, normalized 0–1
# Format: {iso3: {mobile_broadband_per100, internet_pct, composite_score}}
ITU_FALLBACK: dict[str, dict] = {
    "GHA": {"mobile_broadband_per100": 45.2, "internet_pct": 53.0, "composite": 0.38},
    "KEN": {"mobile_broadband_per100": 52.1, "internet_pct": 40.0, "composite": 0.40},
    "NGA": {"mobile_broadband_per100": 38.4, "internet_pct": 36.0, "composite": 0.32},
    "ETH": {"mobile_broadband_per100": 18.2, "internet_pct": 22.0, "composite": 0.18},
    "TZA": {"mobile_broadband_per100": 28.5, "internet_pct": 25.0, "composite": 0.23},
    "UGA": {"mobile_broadband_per100": 22.4, "internet_pct": 26.0, "composite": 0.21},
    "MOZ": {"mobile_broadband_per100": 15.8, "internet_pct": 17.0, "composite": 0.15},
    "ZMB": {"mobile_broadband_per100": 35.6, "internet_pct": 32.0, "composite": 0.30},
    "ZWE": {"mobile_broadband_per100": 38.2, "internet_pct": 35.0, "composite": 0.32},
    "CMR": {"mobile_broadband_per100": 25.4, "internet_pct": 36.0, "composite": 0.27},
    "CIV": {"mobile_broadband_per100": 33.2, "internet_pct": 44.0, "composite": 0.32},
    "SEN": {"mobile_broadband_per100": 42.8, "internet_pct": 46.0, "composite": 0.37},
    "BGD": {"mobile_broadband_per100": 55.4, "internet_pct": 39.0, "composite": 0.42},
    "IND": {"mobile_broadband_per100": 68.2, "internet_pct": 52.0, "composite": 0.55},
    "PAK": {"mobile_broadband_per100": 48.5, "internet_pct": 36.0, "composite": 0.38},
    "NPL": {"mobile_broadband_per100": 62.1, "internet_pct": 42.0, "composite": 0.46},
    "PHL": {"mobile_broadband_per100": 72.4, "internet_pct": 68.0, "composite": 0.65},
    "MMR": {"mobile_broadband_per100": 44.2, "internet_pct": 38.0, "composite": 0.36},
    "KHM": {"mobile_broadband_per100": 48.8, "internet_pct": 52.0, "composite": 0.44},
    "VNM": {"mobile_broadband_per100": 74.5, "internet_pct": 78.0, "composite": 0.70},
}

# Women, Business and the Law (WBL) scores — economic participation constraints
# Source: World Bank WBL 2024, score 0–100 (100 = full legal equality)
WBL_SCORES: dict[str, dict] = {
    "GHA": {"score": 78.8, "mobility": 100, "workplace": 88, "pay": 75, "marriage": 80,
            "parenthood": 60, "entrepreneurship": 75, "assets": 80, "pension": 50},
    "BGD": {"score": 49.4, "mobility": 100, "workplace": 56, "pay": 25, "marriage": 40,
            "parenthood": 40, "entrepreneurship": 50, "assets": 60, "pension": 25},
    "KEN": {"score": 76.3, "mobility": 100, "workplace": 88, "pay": 75, "marriage": 80,
            "parenthood": 60, "entrepreneurship": 75, "assets": 60, "pension": 50},
    "NGA": {"score": 69.4, "mobility": 100, "workplace": 75, "pay": 63, "marriage": 60,
            "parenthood": 60, "entrepreneurship": 75, "assets": 80, "pension": 25},
    "IND": {"score": 74.4, "mobility": 100, "workplace": 88, "pay": 50, "marriage": 80,
            "parenthood": 60, "entrepreneurship": 88, "assets": 80, "pension": 25},
    "PAK": {"score": 37.5, "mobility": 75, "workplace": 44, "pay": 25, "marriage": 20,
            "parenthood": 40, "entrepreneurship": 38, "assets": 40, "pension": 25},
    "PHL": {"score": 81.9, "mobility": 100, "workplace": 88, "pay": 75, "marriage": 80,
            "parenthood": 80, "entrepreneurship": 88, "assets": 80, "pension": 50},
    "ETH": {"score": 60.6, "mobility": 100, "workplace": 75, "pay": 50, "marriage": 40,
            "parenthood": 40, "entrepreneurship": 75, "assets": 80, "pension": 25},
}


async def get_digital_access(country_code: str) -> dict:
    """Returns digital access composite score and components."""
    cache_key = f"itu:{country_code}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    # Try to fetch from WDI internet users indicator as live fallback
    try:
        url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/IT.NET.USER.ZS"
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params={"format": "json", "mrv": 1})
            resp.raise_for_status()
            data = resp.json()
            entries = data[1] if len(data) > 1 and data[1] else []
            internet_pct = next((e["value"] for e in entries if e.get("value")), None)
            if internet_pct is not None:
                composite = min(1.0, internet_pct / 100 * 0.85)
                result = {
                    "internet_pct": round(internet_pct, 1),
                    "mobile_broadband_per100": None,
                    "composite": round(composite, 2),
                    "source": "WDI live",
                }
                cache_set(cache_key, result, ttl_seconds=86400)
                return result
    except Exception:
        pass

    embedded = ITU_FALLBACK.get(country_code.upper())
    if embedded:
        result = {**embedded, "source": "ITU embedded 2023"}
    else:
        result = {"composite": 0.35, "internet_pct": None, "mobile_broadband_per100": None,
                  "source": "global LMIC average (fallback)"}

    cache_set(cache_key, result, ttl_seconds=3600)
    return result


def get_wbl_score(country_code: str) -> dict | None:
    """Women, Business and the Law score for a country."""
    return WBL_SCORES.get(country_code.upper())
