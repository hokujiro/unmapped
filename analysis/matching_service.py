"""
Module 03 — Opportunity Matching & Econometric Dashboard (Signal Layer architecture)

5-component visible scoring:
  skill_fit       (0.30) — ESCO/ISCO overlap
  reachability    (0.20) — education + location + access constraints
  income_signal   (0.20) — wage floor vs country median
  sector_signal   (0.20) — employment growth trajectory
  resilience_uplift (0.10) — how much this reduces automation exposure

Policymaker dashboard — 3 views:
  1. Skills supply   — dominant clusters, education distribution
  2. Opportunity demand — sector growth, skill gap hotspots
  3. 2035 divergence — WCDE credential trajectory vs labour demand
"""

from __future__ import annotations

import asyncio
import os

from adapters.ilostat import fetch_employment_by_sector, fetch_wages_by_sector
from adapters.itu import get_wbl_score
from adapters.tavily import search_opportunities
from adapters.wittgenstein import fetch_education_projections
from adapters.world_bank import fetch_country_profile, fetch_sector_employment
from analysis.models import (
    Divergence2035View,
    EconometricSignals,
    MatchingResult,
    Opportunity,
    OpportunityDemandView,
    OpportunityScoreBreakdown,
    PolicymakerView,
    SkillsProfile,
    SkillsSupplyView,
)
from config.models import CountryConfig, EducationLevel, OpportunityType

SCORE_WEIGHTS = {
    "skill_fit": 0.30,
    "reachability": 0.20,
    "income_signal": 0.20,
    "sector_signal": 0.20,
    "resilience_uplift": 0.10,
}

_OPPORTUNITY_TEMPLATES: list[dict] = [
    {
        "title": "Electronics / ICT Equipment Technician",
        "isco_code": "7422",
        "sector_isic": "J",
        "sector_label": "Information and communication",
        "opportunity_type": "formal_employment",
        "required_skills": ["phone_repair", "electronics", "basic_coding"],
        "education_min": EducationLevel.lower_secondary,
        "income_signal_factor": 0.90,
        "sector_growth_proxy": "services",
        "resilience_score": 0.65,
        "realism_note": "Growing demand in urban areas; formal employers may require TVET certification.",
        "wbl_sensitive": False,
    },
    {
        "title": "Solar / Renewable Energy Installer",
        "isco_code": "7411",
        "sector_isic": "D",
        "sector_label": "Electricity, gas and water supply",
        "opportunity_type": "formal_employment",
        "required_skills": ["electronics", "phone_repair"],
        "education_min": EducationLevel.lower_secondary,
        "income_signal_factor": 1.05,
        "sector_growth_proxy": "services",
        "resilience_score": 0.72,
        "realism_note": "Fastest-growing green sector. Certification often available through NGO programmes.",
        "wbl_sensitive": False,
    },
    {
        "title": "Mobile Money / Fintech Agent",
        "isco_code": "5221",
        "sector_isic": "K",
        "sector_label": "Financial and insurance activities",
        "opportunity_type": "self_employment",
        "required_skills": ["customer_service", "multilingual", "basic_coding"],
        "education_min": EducationLevel.primary,
        "income_signal_factor": 0.75,
        "sector_growth_proxy": "services",
        "resilience_score": 0.55,
        "realism_note": "Low barrier to entry; income is variable and network-dependent.",
        "wbl_sensitive": True,
    },
    {
        "title": "IT Support Technician",
        "isco_code": "3512",
        "sector_isic": "J",
        "sector_label": "Information and communication",
        "opportunity_type": "formal_employment",
        "required_skills": ["basic_coding", "electronics", "problem_solving"],
        "education_min": EducationLevel.upper_secondary,
        "income_signal_factor": 1.20,
        "sector_growth_proxy": "services",
        "resilience_score": 0.60,
        "realism_note": "Competitive urban market; certification (CompTIA, Cisco) significantly increases hireability.",
        "wbl_sensitive": False,
    },
    {
        "title": "Community Health Worker",
        "isco_code": "5321",
        "sector_isic": "Q",
        "sector_label": "Human health and social work",
        "opportunity_type": "formal_employment",
        "required_skills": ["customer_service", "teaching", "multilingual"],
        "education_min": EducationLevel.lower_secondary,
        "income_signal_factor": 0.80,
        "sector_growth_proxy": "services",
        "resilience_score": 0.85,
        "realism_note": "NGO and government programmes often sponsor training and provide stipends.",
        "wbl_sensitive": False,
    },
    {
        "title": "Freelance Digital Services (translation, transcription)",
        "isco_code": "4131",
        "sector_isic": "J",
        "sector_label": "Information and communication",
        "opportunity_type": "gig",
        "required_skills": ["basic_coding", "multilingual", "data_entry"],
        "education_min": EducationLevel.primary,
        "income_signal_factor": 0.60,
        "sector_growth_proxy": "services",
        "resilience_score": 0.35,
        "realism_note": "Requires reliable internet. Income highly variable. High routine automation risk.",
        "wbl_sensitive": False,
    },
    {
        "title": "TVET Skills Training Pathway",
        "isco_code": "N/A",
        "sector_isic": "P",
        "sector_label": "Education",
        "opportunity_type": "training_pathway",
        "required_skills": [],
        "education_min": EducationLevel.primary,
        "income_signal_factor": 0.0,
        "sector_growth_proxy": "services",
        "resilience_score": 0.80,
        "realism_note": "Government and donor-funded TVET programmes can bridge skill gap in 6–18 months.",
        "wbl_sensitive": False,
    },
    {
        "title": "Agricultural Value Chain Agent",
        "isco_code": "6130",
        "sector_isic": "A",
        "sector_label": "Agriculture, forestry and fishing",
        "opportunity_type": "self_employment",
        "required_skills": ["customer_service", "management"],
        "education_min": EducationLevel.primary,
        "income_signal_factor": 0.65,
        "sector_growth_proxy": "agriculture",
        "resilience_score": 0.45,
        "realism_note": "High seasonal variability. Mobile money and digital market access increasing returns.",
        "wbl_sensitive": True,
    },
]

_EDUCATION_ORDER = [
    EducationLevel.no_formal, EducationLevel.primary, EducationLevel.lower_secondary,
    EducationLevel.upper_secondary, EducationLevel.post_secondary, EducationLevel.tertiary,
]


def _edu_rank(level: EducationLevel) -> int:
    try:
        return _EDUCATION_ORDER.index(level)
    except ValueError:
        return 0


def _skill_overlap(profile_skills: list[str], required: list[str]) -> tuple[float, list[str]]:
    if not required:
        return 1.0, []
    pl = {s.lower().replace(" ", "_") for s in profile_skills}
    rl = [s.lower().replace(" ", "_") for s in required]
    matched = sum(1 for r in rl if r in pl)
    gap = [r for r in required if r.lower().replace(" ", "_") not in pl]
    return round(matched / len(rl), 2), gap


def _reachability(profile: SkillsProfile, tmpl: dict, edu_rank_profile: int) -> float:
    score = 1.0
    if _edu_rank(tmpl["education_min"]) > edu_rank_profile:
        score *= 0.3
    if not profile.is_urban and tmpl["opportunity_type"] == "formal_employment":
        score *= 0.75
    if profile.digital_access_level == "none" and tmpl["sector_isic"] == "J":
        score *= 0.4
    elif profile.digital_access_level == "mobile_only" and tmpl["sector_isic"] == "J":
        score *= 0.8
    return round(min(1.0, score), 2)


def _income_signal(
    tmpl: dict,
    wb_profile: dict,
    country_config: CountryConfig,
    latest_wage: float | None,
) -> float:
    factor = tmpl["income_signal_factor"]
    if factor == 0.0:
        return 0.0
    if latest_wage:
        return min(1.0, factor)
    gdp_pc = wb_profile.get("gdp_per_capita") or 2000
    estimated_monthly = (gdp_pc / 12) * 0.45
    return min(1.0, factor * 0.7)


def _sector_signal(tmpl: dict, wb_sectors: dict) -> float:
    proxy = tmpl.get("sector_growth_proxy", "services")
    share = (wb_sectors or {}).get(proxy)
    if share is None:
        return 0.5
    # Services >40% = strong; Agriculture declining = weak
    growth_map = {"services": min(1.0, share / 60), "industry": min(1.0, share / 30),
                  "agriculture": max(0.1, 1.0 - share / 80)}
    return round(growth_map.get(proxy, 0.5), 2)


def _wage_usd_estimate(tmpl: dict, wb_profile: dict) -> float | None:
    factor = tmpl["income_signal_factor"]
    if factor == 0.0:
        return None
    gdp_pc = wb_profile.get("gdp_per_capita") or 2000
    return round((gdp_pc / 12) * 0.45 * factor, 1)


def _compute_score(skill_fit: float, reachability: float, income: float,
                   sector: float, resilience: float) -> OpportunityScoreBreakdown:
    w = SCORE_WEIGHTS
    composite = (
        skill_fit * w["skill_fit"]
        + reachability * w["reachability"]
        + income * w["income_signal"]
        + sector * w["sector_signal"]
        + resilience * w["resilience_uplift"]
    )
    return OpportunityScoreBreakdown(
        skill_fit=round(skill_fit, 2),
        reachability=round(reachability, 2),
        income_signal=round(income, 2),
        sector_signal=round(sector, 2),
        resilience_uplift=round(resilience, 2),
        composite=round(composite, 3),
        weights=w,
    )


async def run_matching(
    profile: SkillsProfile,
    country_config: CountryConfig,
    include_policymaker_view: bool = False,
) -> MatchingResult:
    fallback_used = False

    # ── Fetch data in parallel ────────────────────────────────────────────────
    (wb_profile, ilo_wages, ilo_employment, wb_sectors, edu_projection) = await asyncio.gather(
        fetch_country_profile(country_config.wdi_country_code),
        fetch_wages_by_sector(country_config.ilostat_country_code),
        fetch_employment_by_sector(country_config.ilostat_country_code),
        fetch_sector_employment(country_config.wdi_country_code),
        fetch_education_projections(country_config.country_code, country_config.wittgenstein_scenario),
        return_exceptions=True,
    )
    if isinstance(wb_profile, Exception): wb_profile = {}
    if isinstance(ilo_wages, Exception): ilo_wages = []
    if isinstance(ilo_employment, Exception): ilo_employment = []
    if isinstance(wb_sectors, Exception): wb_sectors = {}
    if isinstance(edu_projection, Exception): edu_projection = {"available": False}

    latest_wage = ilo_wages[0]["value"] if ilo_wages else None
    wbl = get_wbl_score(country_config.country_code)
    edu_rank_profile = _edu_rank(profile.education_level)
    enabled_types = {t.value for t in country_config.enabled_opportunity_types}
    all_skills = list({*profile.skills, *[s for hist in profile.work_history for s in _extract_skills(hist)]})

    # ── Score opportunities ───────────────────────────────────────────────────
    opportunities: list[Opportunity] = []
    for tmpl in _OPPORTUNITY_TEMPLATES:
        if tmpl["opportunity_type"] not in enabled_types:
            continue

        skill_fit, gap = _skill_overlap(all_skills, tmpl["required_skills"])
        reach = _reachability(profile, tmpl, edu_rank_profile)
        income = _income_signal(tmpl, wb_profile, country_config, latest_wage)
        sector = _sector_signal(tmpl, wb_sectors)
        resilience = tmpl["resilience_score"]
        score_bd = _compute_score(skill_fit, reach, income, sector, resilience)

        wage_usd = _wage_usd_estimate(tmpl, wb_profile)
        wage_local = round(latest_wage * tmpl["income_signal_factor"], 1) if latest_wage and tmpl["income_signal_factor"] > 0 else None

        wbl_note = None
        if tmpl.get("wbl_sensitive") and wbl:
            if wbl["score"] < 60:
                wbl_note = f"Legal constraints may apply: WBL score {wbl['score']}/100 — check local regulations on women's workplace rights."

        opportunities.append(Opportunity(
            title=tmpl["title"],
            isco_code=tmpl["isco_code"],
            opportunity_type=tmpl["opportunity_type"],
            sector_isic=tmpl["sector_isic"],
            sector_label=tmpl["sector_label"],
            wage_floor_local=wage_local,
            wage_floor_usd=wage_usd,
            sector_employment_growth_pct=_sector_pct(tmpl, wb_sectors),
            score_breakdown=score_bd,
            skill_gap=gap,
            realism_note=tmpl["realism_note"],
            data_confidence="medium" if latest_wage else "low",
            wbl_note=wbl_note,
        ))

    opportunities.sort(key=lambda o: o.score_breakdown.composite, reverse=True)

    # ── Tavily discovery (optional) ───────────────────────────────────────────
    tavily_enabled = bool(os.environ.get("TAVILY_API_KEY"))
    if tavily_enabled and opportunities:
        top_opp = opportunities[0]
        from adapters.ilo_genai import get_genai_entry
        tavily_results = await search_opportunities(
            country_name=country_config.country_name,
            occupation_label=top_opp.title,
            opportunity_types=list(enabled_types),
        )
        for tr in tavily_results[:2]:
            skill_fit, gap = _skill_overlap(all_skills, [])
            score_bd = _compute_score(0.7, 0.8, 0.5, 0.6, 0.5)
            opportunities.append(Opportunity(
                title=tr["title"][:80],
                isco_code="N/A",
                opportunity_type="training_pathway",
                sector_isic="P",
                sector_label="Education / Training",
                score_breakdown=score_bd,
                skill_gap=[],
                realism_note=tr["snippet"][:150],
                data_confidence="low",
                source_type="tavily_discovery",
                source_url=tr["url"],
                source_snippet=tr["snippet"],
            ))

    # ── Econometric signals ───────────────────────────────────────────────────
    from adapters.itu import get_digital_access
    digital_data = await get_digital_access(country_config.wdi_country_code)

    eco_signals = EconometricSignals(
        wage_data={
            "mean_monthly_local_currency": latest_wage,
            "currency": country_config.currency_code,
            "year": ilo_wages[0]["period"] if ilo_wages else None,
            "note": "National mean across all sectors (ILOSTAT)",
        } if latest_wage else None,
        sector_employment_growth=wb_sectors or None,
        youth_unemployment_rate=wb_profile.get("youth_unemployment"),
        self_employed_share=wb_profile.get("self_employed_share"),
        human_capital_index=wb_profile.get("human_capital_index"),
        digital_access_composite=digital_data.get("composite"),
        wbl_score=wbl["score"] if wbl else None,
        data_year="2022",
        sources=["ILOSTAT", "World Bank WDI", "ITU DataHub", "World Bank WBL"],
    )

    if not latest_wage and not wb_sectors:
        fallback_used = True

    # ── Policymaker view ──────────────────────────────────────────────────────
    policy_view = None
    if include_policymaker_view:
        policy_view = _build_policymaker_view(
            profile, opportunities, eco_signals, edu_projection, country_config
        )

    return MatchingResult(
        opportunities=opportunities[:7],
        econometric_signals=eco_signals,
        policymaker_view=policy_view,
        country_context_summary={
            "country": country_config.country_name,
            "region": country_config.region,
            "lmic_calibration": country_config.automation_calibration.lmic_discount_factor,
            "enabled_opportunity_types": [t.value for t in country_config.enabled_opportunity_types],
            "wbl_score": wbl["score"] if wbl else None,
        },
        tavily_enabled=tavily_enabled,
        data_sources=["ILOSTAT", "World Bank WDI", "World Bank HCI", "ITU DataHub",
                      "Women Business and the Law (WBL)", "Wittgenstein Centre WCDE"],
        fallback_used=fallback_used,
    )


def _build_policymaker_view(
    profile: SkillsProfile,
    opportunities: list[Opportunity],
    eco: EconometricSignals,
    edu_projection: dict,
    config: CountryConfig,
) -> PolicymakerView:
    from analysis.readiness_service import _SKILL_TASK_MAP

    # Skills supply
    cluster = _isco_cluster(profile.occupation_isco)
    all_skills = list({*profile.skills})
    edu_dist = {profile.education_level.value: 1.0}

    supply = SkillsSupplyView(
        dominant_isco_cluster=cluster,
        education_level_distribution=edu_dist,
        top_skills=all_skills[:6],
        languages=profile.languages or ["en"],
    )

    # Opportunity demand
    sector_signals = []
    if eco.sector_employment_growth:
        for sector, share in eco.sector_employment_growth.items():
            sector_signals.append({"sector": sector, "employment_share_pct": round(share, 1)})
    sector_signals.sort(key=lambda x: x["employment_share_pct"], reverse=True)

    skill_gaps = list({g for o in opportunities for g in o.skill_gap})[:5]
    demand = OpportunityDemandView(
        highest_growth_sectors=sector_signals[:3],
        critical_skill_gaps=skill_gaps,
        formality_share=100 - (eco.self_employed_share or 50),
    )

    # 2035 divergence
    div = _build_divergence(edu_projection, eco, config)

    interventions = _interventions(eco)

    return PolicymakerView(
        total_profiles_analyzed=1,
        skills_supply=supply,
        opportunity_demand=demand,
        divergence_2035=div,
        recommended_interventions=interventions,
        aggregate_econometric_signals=eco,
    )


def _build_divergence(edu_projection: dict, eco: EconometricSignals, config: CountryConfig) -> Divergence2035View:
    trajectory: dict[str, float] = {}
    if edu_projection.get("available"):
        trajectory = {str(k): v for k, v in edu_projection.get("upper_secondary_plus_pct", {}).items()}

    # Labour demand trajectory: proxy using sector growth signals
    services_share = (eco.sector_employment_growth or {}).get("services", 45)
    demand_trajectory = {
        "2020": "Predominantly routine/manual",
        "2025": "Rising digital services demand",
        "2030": "GenAI accelerates — non-routine cognitive premium",
        "2035": "Strong: analytical, interpersonal, technical specialisation",
    }

    current = edu_projection.get("current_pct", 40)
    projected = edu_projection.get("projected_2035_pct", 55)
    change = edu_projection.get("absolute_change", 15)

    if change > 15 and services_share > 40:
        gap = "widening"
        surplus = f"By 2035, secondary completion rises to {projected:.0f}% but labour market increasingly demands digital-specialised skills. Credential supply outpaces signal-ready skills — a growing mismatch."
        interpretation = (
            f"Education attainment is expanding ({current:.0f}% → {projected:.0f}%), but the services sector "
            f"({services_share:.0f}% of employment) is shifting toward non-routine cognitive work. "
            f"Without targeted signalling infrastructure, rising credentials will not translate into "
            f"employability — this is the core gap UNMAPPED addresses."
        )
    elif change > 8:
        gap = "stable"
        surplus = f"Secondary completion rising moderately ({current:.0f}% → {projected:.0f}%). Labour demand evolving at similar pace."
        interpretation = "Moderate credential expansion matched by gradual labour market evolution. Vocational pathways need strengthening."
    else:
        gap = "converging"
        surplus = "Credential growth is slow relative to labour demand — structural barriers to education access likely."
        interpretation = "Structural barriers to education access require policy intervention before skills signalling can be effective."

    return Divergence2035View(
        education_trajectory=trajectory,
        labour_demand_trajectory=demand_trajectory,
        divergence_gap=gap,
        projected_credential_surplus=surplus,
        interpretation=interpretation,
        wcde_scenario=config.wittgenstein_scenario,
    )


def _interventions(eco: EconometricSignals) -> list[str]:
    interventions = []
    if (eco.youth_unemployment_rate or 0) > 20:
        interventions.append("Targeted youth employment subsidies or wage-top-up programmes")
    if (eco.self_employed_share or 0) > 55:
        interventions.append("Formalization support and access-to-finance for micro-enterprises")
    if (eco.human_capital_index or 1) < 0.5:
        interventions.append("Investment in foundational skills (literacy, numeracy, digital basics)")
    if (eco.digital_access_composite or 1) < 0.5:
        interventions.append("Digital infrastructure investment to unblock AI-complementary job access")
    if eco.wbl_score and eco.wbl_score < 65:
        interventions.append("Legal reform to remove barriers to women's economic participation (WBL score low)")
    interventions.append("TVET-employer partnership schemes to align training to market demand")
    interventions.append("Open skills-signalling infrastructure (like UNMAPPED) to make informal skills legible")
    return interventions


def _extract_skills(text: str) -> list[str]:
    from analysis.readiness_service import _EVIDENCE_SKILL_MAP
    found = []
    tl = text.lower()
    for kw, skills in _EVIDENCE_SKILL_MAP.items():
        if kw in tl:
            found.extend(skills)
    return found


def _isco_cluster(isco_code: str) -> str:
    major = isco_code[0] if isco_code else "9"
    return {"1": "Managers", "2": "Professionals", "3": "Technicians",
            "4": "Clerical workers", "5": "Service & sales", "6": "Agricultural",
            "7": "Craft & trade workers", "8": "Machine operators", "9": "Elementary"}.get(major, "Unknown")


def _sector_pct(tmpl: dict, wb_sectors: dict) -> float | None:
    proxy = tmpl.get("sector_growth_proxy", "services")
    growth_map = {"services": 3.5, "industry": 2.1, "agriculture": 0.8}
    return growth_map.get(proxy)
