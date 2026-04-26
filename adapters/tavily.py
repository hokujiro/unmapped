"""
Tavily Search connector — opportunity discovery layer.

Used ONLY for discovering real training programmes, apprenticeship pages,
NGO employment services, and public sector job portals. NOT used for core
labour statistics (those come from ILOSTAT/WDI).

Requires TAVILY_API_KEY environment variable. Gracefully degrades to empty
results when key is absent — the rest of the system is unaffected.

Docs: https://docs.tavily.com/documentation/api-reference/introduction
"""

from __future__ import annotations

import os

import httpx

from core.cache import cache_get, cache_set

_TAVILY_BASE = "https://api.tavily.com"


def _get_key() -> str | None:
    return os.environ.get("TAVILY_API_KEY")


async def search_opportunities(
    country_name: str,
    occupation_label: str,
    opportunity_types: list[str],
    max_results: int = 4,
) -> list[dict]:
    """
    Search for real training programmes, apprenticeships, and employment services.
    Returns list of {title, url, snippet, source_type} dicts.
    """
    key = _get_key()
    if not key:
        return []

    query = (
        f"{occupation_label} training programme apprenticeship {country_name} "
        f"employment opportunity skills development"
    )
    cache_key = f"tavily:search:{country_name}:{occupation_label[:30]}"
    cached = cache_get(cache_key, ttl_seconds=3600 * 6)
    if cached is not None:
        return cached

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{_TAVILY_BASE}/search",
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "query": query,
                    "search_depth": "basic",
                    "max_results": max_results,
                    "include_domains": [
                        "ilo.org", "worldbank.org", "unesco.org",
                        "gov.gh", "gov.bd", "tvetnewspaper.com",
                        "unctad.org", "youth.gov",
                    ],
                    "exclude_domains": ["reddit.com", "quora.com"],
                },
            )
            resp.raise_for_status()
            data = resp.json()

        results = [
            {
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "snippet": r.get("content", "")[:200],
                "source_type": "tavily_discovery",
                "relevance_score": r.get("score", 0.0),
            }
            for r in data.get("results", [])
        ]
        cache_set(cache_key, results, ttl_seconds=3600 * 6)
        return results

    except Exception:
        return []


async def extract_opportunity(url: str) -> dict | None:
    """
    Extract structured opportunity data from a known URL (training provider, NGO page).
    """
    key = _get_key()
    if not key:
        return None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{_TAVILY_BASE}/extract",
                headers={"Authorization": f"Bearer {key}"},
                json={"urls": [url]},
            )
            resp.raise_for_status()
            data = resp.json()
            results = data.get("results", [])
            if results:
                return {
                    "url": url,
                    "content": results[0].get("raw_content", "")[:500],
                    "source_type": "tavily_extract",
                }
    except Exception:
        pass
    return None
