from fastapi import APIRouter, Query

from analysis.matching_service import run_matching
from analysis.models import MatchingResult, ReadinessResult, SkillsProfile
from analysis.readiness_service import run_readiness
from config import store
from core.exceptions import CountryNotConfigured

router = APIRouter(prefix="/analysis", tags=["Economic Analysis"])


@router.post(
    "/readiness",
    response_model=ReadinessResult,
    summary="AI Readiness & Displacement Risk (Module 02)",
    description=(
        "Given a skills profile and country code, returns a LMIC-calibrated automation "
        "risk assessment. Uses Frey-Osborne occupation scores, ILO task indices, and "
        "Wittgenstein Centre 2025–2035 education projections. "
        "The country must be registered via POST /config/countries."
    ),
)
async def readiness(profile: SkillsProfile) -> ReadinessResult:
    config = store.get(profile.country_code)
    if not config:
        raise CountryNotConfigured(profile.country_code)
    return await run_readiness(profile, config)


@router.post(
    "/matching",
    response_model=MatchingResult,
    summary="Opportunity Matching & Econometric Dashboard (Module 03)",
    description=(
        "Surfaces realistic labor market opportunities grounded in ILOSTAT wage data, "
        "World Bank WDI sector signals, and Human Capital Index. "
        "Includes dual view: youth-facing opportunities + optional policymaker dashboard. "
        "At minimum two econometric signals (wage floor, sector employment growth) are "
        "always surfaced explicitly."
    ),
)
async def matching(
    profile: SkillsProfile,
    policymaker_view: bool = Query(
        default=False,
        description="Include aggregate policymaker signals in the response.",
    ),
) -> MatchingResult:
    config = store.get(profile.country_code)
    if not config:
        raise CountryNotConfigured(profile.country_code)
    return await run_matching(profile, config, include_policymaker_view=policymaker_view)
