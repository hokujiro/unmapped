"""
ILOSTAT SDMX REST API adapter.
Public API — no auth required.
Docs: https://ilostat.ilo.org/resources/ilostat-api/

Key datasets:
  EMP_TEMP_SEX_ECO_NB_A  — Employment by sex and economic activity (ISIC)
  EAR_4MTH_SEX_ECO_CUR   — Mean monthly earnings by sex and economic activity
  UNE_TUNE_SEX_AGE_NB_A  — Unemployment by sex and age
"""

from __future__ import annotations

import httpx

from core.cache import cache_get, cache_set

_ILO_BASE = "https://sdmx.ilo.org/rest"

# ISIC sector codes → human-readable labels
ISIC_LABELS: dict[str, str] = {
    "A": "Agriculture, forestry and fishing",
    "B": "Mining and quarrying",
    "C": "Manufacturing",
    "D": "Electricity, gas, steam and air conditioning",
    "E": "Water supply; sewerage and waste management",
    "F": "Construction",
    "G": "Wholesale and retail trade",
    "H": "Transportation and storage",
    "I": "Accommodation and food service",
    "J": "Information and communication",
    "K": "Financial and insurance activities",
    "L": "Real estate",
    "M": "Professional, scientific and technical activities",
    "N": "Administrative and support services",
    "O": "Public administration and defence",
    "P": "Education",
    "Q": "Human health and social work",
    "R": "Arts, entertainment and recreation",
    "S": "Other service activities",
    "T": "Activities of households as employers",
}


async def fetch_employment_by_sector(
    country_code: str,
    start_year: int = 2018,
    end_year: int = 2023,
) -> list[dict]:
    """
    Returns employment figures by ISIC sector for a country.
    Uses ILO dataflow EMP_TEMP_SEX_ECO_NB_A (total employment by economic activity).
    """
    cache_key = f"ilo:emp_sector:{country_code}:{start_year}-{end_year}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    # ILO SDMX key: dataset/REF_AREA.SEX.CLASSIF1.MEASURE
    # SEX=T (total), CLASSIF1=ECO_ISIC4_TOTAL → broad sectors
    dataflow = "ILO,DF_EMP_TEMP_SEX_ECO_NB_A,1.0"
    key = f"{country_code}.SEX_T.ECO_ISIC4_TOTAL.NB"
    url = f"{_ILO_BASE}/data/{dataflow}/{key}"
    params = {
        "format": "jsondata",
        "startPeriod": str(start_year),
        "endPeriod": str(end_year),
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        result = _parse_sdmx_json(data)
        cache_set(cache_key, result, ttl_seconds=86400)
        return result
    except Exception:
        return []


async def fetch_wages_by_sector(
    country_code: str,
    start_year: int = 2018,
    end_year: int = 2023,
) -> list[dict]:
    """
    Returns mean monthly earnings by economic activity.
    Uses ILO dataflow EAR_4MTH_SEX_ECO_CUR_NB_A.
    """
    cache_key = f"ilo:wages:{country_code}:{start_year}-{end_year}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    dataflow = "ILO,DF_EAR_4MTH_SEX_ECO_CUR_NB_A,1.0"
    key = f"{country_code}.SEX_T.ECO_ISIC4_TOTAL.CUR_TYPE_LCU.NB"
    url = f"{_ILO_BASE}/data/{dataflow}/{key}"
    params = {
        "format": "jsondata",
        "startPeriod": str(start_year),
        "endPeriod": str(end_year),
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        result = _parse_sdmx_json(data)
        cache_set(cache_key, result, ttl_seconds=86400)
        return result
    except Exception:
        return []


def _parse_sdmx_json(data: dict) -> list[dict]:
    """Parse ILO SDMX-JSON format into [{period, value, series_key}]."""
    try:
        structure = data["data"]["structure"]
        datasets = data["data"]["dataSets"]
        if not datasets:
            return []

        dimensions = structure["dimensions"]["series"]
        time_dims = structure["dimensions"]["observation"]

        result = []
        for series_key, series_data in datasets[0].get("series", {}).items():
            dim_values = series_key.split(":")
            dim_labels = {}
            for i, dim in enumerate(dimensions):
                if i < len(dim_values):
                    idx = int(dim_values[i])
                    values = dim.get("values", [])
                    if idx < len(values):
                        dim_labels[dim["id"]] = values[idx].get("id", "")

            for obs_key, obs_val in series_data.get("observations", {}).items():
                obs_idx = int(obs_key)
                time_vals = time_dims[0].get("values", [])
                period = time_vals[obs_idx]["id"] if obs_idx < len(time_vals) else obs_key
                value = obs_val[0] if obs_val else None
                if value is not None:
                    result.append({"period": period, "value": value, **dim_labels})

        result.sort(key=lambda x: x["period"], reverse=True)
        return result
    except (KeyError, IndexError, TypeError):
        return []
