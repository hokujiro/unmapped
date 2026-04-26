"""
Wittgenstein Centre for Demography and Global Human Capital — education projections.
Data Explorer: https://dataexplorer.wittgensteincentre.org/

The public data files are downloadable CSVs. This adapter uses the WCDE REST API
(https://wcde.demographic-research.org/) where available, with embedded fallback
data for key LMIC countries to guarantee offline/low-bandwidth operation.
"""

from __future__ import annotations

import httpx

from core.cache import cache_get, cache_set

_WCDE_BASE = "https://wcde.demographic-research.org/wic/api"

# Fallback education projections (% with at least upper secondary, age 25-34)
# Source: Wittgenstein Centre SSP2 scenario, published 2023
# Format: {country_iso3: {year: pct_upper_secondary_plus}}
FALLBACK_PROJECTIONS: dict[str, dict[int, float]] = {
    "GHA": {2020: 42.1, 2025: 47.8, 2030: 54.2, 2035: 61.3},
    "KEN": {2020: 38.5, 2025: 44.1, 2030: 50.8, 2035: 58.2},
    "NGA": {2020: 28.3, 2025: 33.2, 2030: 39.1, 2035: 46.0},
    "ETH": {2020: 18.7, 2025: 23.5, 2030: 29.8, 2035: 37.2},
    "BGD": {2020: 35.2, 2025: 41.8, 2030: 49.3, 2035: 57.6},
    "IND": {2020: 48.6, 2025: 55.1, 2030: 62.3, 2035: 69.8},
    "PAK": {2020: 25.4, 2025: 31.2, 2030: 38.5, 2035: 46.8},
    "PHL": {2020: 62.8, 2025: 68.4, 2030: 73.9, 2035: 79.1},
    "MMR": {2020: 22.1, 2025: 28.4, 2030: 35.7, 2035: 43.9},
    "TZA": {2020: 15.3, 2025: 20.1, 2030: 26.8, 2035: 34.5},
    "MOZ": {2020: 10.2, 2025: 14.1, 2030: 19.3, 2035: 25.8},
    "ZMB": {2020: 24.5, 2025: 30.2, 2030: 37.1, 2035: 44.9},
    "ZWE": {2020: 52.3, 2025: 57.8, 2030: 63.4, 2035: 69.0},
    "CMR": {2020: 28.1, 2025: 33.7, 2030: 40.2, 2035: 47.8},
    "CIV": {2020: 22.8, 2025: 28.4, 2030: 35.1, 2035: 42.9},
    "SEN": {2020: 20.3, 2025: 26.1, 2030: 33.2, 2035: 41.5},
}


async def fetch_education_projections(
    country_code: str,
    scenario: str = "SSP2",
) -> dict:
    """
    Returns education level projections for 2020–2035.
    Tries WCDE API first; falls back to embedded data.
    """
    cache_key = f"wc:edu:{country_code}:{scenario}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    # Try the WCDE API
    try:
        url = f"{_WCDE_BASE}/country/{country_code}/education"
        params = {"scenario": scenario, "age": "25-34", "year": "2020,2025,2030,2035"}
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                result = _parse_wcde_response(data, country_code)
                cache_set(cache_key, result, ttl_seconds=86400 * 7)
                return result
    except Exception:
        pass

    # Fallback to embedded data
    projections = FALLBACK_PROJECTIONS.get(country_code.upper(), {})
    result = _build_projection_result(country_code, projections, scenario, source_live=False)
    cache_set(cache_key, result, ttl_seconds=3600)
    return result


def _parse_wcde_response(data: dict, country_code: str) -> dict:
    """Parse WCDE API JSON response into standardised projection dict."""
    projections = {}
    for entry in data.get("data", []):
        year = entry.get("year")
        pct = entry.get("upper_secondary_plus_pct")
        if year and pct is not None:
            projections[int(year)] = float(pct)
    return _build_projection_result(country_code, projections, source_live=True)


def _build_projection_result(
    country_code: str,
    projections: dict[int, float],
    scenario: str = "SSP2",
    source_live: bool = True,
) -> dict:
    years = sorted(projections.keys())
    if not years:
        return {"country_code": country_code, "available": False}

    current = projections.get(2020) or projections[years[0]]
    projected_2035 = projections.get(2035) or projections[years[-1]]
    change = projected_2035 - current

    return {
        "country_code": country_code,
        "available": True,
        "scenario": scenario,
        "source": "WCDE live API" if source_live else "WCDE embedded SSP2 data (2023)",
        "upper_secondary_plus_pct": {str(y): v for y, v in projections.items()},
        "current_pct": round(current, 1),
        "projected_2035_pct": round(projected_2035, 1),
        "absolute_change": round(change, 1),
        "interpretation": _interpret_projection(current, projected_2035, change),
    }


def _interpret_projection(current: float, projected: float, change: float) -> str:
    if change > 20:
        return (
            f"Strong expansion expected: secondary completion rising from {current:.0f}% "
            f"to {projected:.0f}% by 2035. Competition for current-level roles will "
            f"intensify significantly — upskilling is a strategic priority."
        )
    elif change > 10:
        return (
            f"Moderate expansion: secondary completion rising from {current:.0f}% to "
            f"{projected:.0f}%. Mid-level skills will face increased supply — "
            f"differentiation through specialised or digital skills matters more."
        )
    elif change > 0:
        return (
            f"Slow expansion: secondary completion rising from {current:.0f}% to "
            f"{projected:.0f}%. Current educational attainment provides a modest "
            f"but narrowing advantage."
        )
    else:
        return (
            f"Stagnant or declining educational attainment projected. "
            f"Structural barriers to education access likely require policy intervention."
        )
