"""
Module 02 — AI Readiness & Displacement Risk Lens (Signal Layer architecture)

Score hierarchy (per the architecture doc):
1. PRIMARY:  ILO WP140 (2024) GenAI exposure — ISCO-linked, global, distinguishes
             exposure from complementarity.
2. CALIBRATION: Near-term feasibility = structural_exposure × LMIC adjustments
             (digital access, employer adoption, infrastructure, formality).
             ILO-WBG LatAm finding: up to 50% of exposed jobs bottlenecked by
             digital access gaps.
3. LEGACY:   Frey-Osborne (2013) retained as a comparator — labelled clearly.
"""

from __future__ import annotations

from adapters.frey_osborne import get_automation_entry
from adapters.ilo_genai import CATEGORY_DESCRIPTIONS, get_genai_entry
from adapters.itu import get_digital_access
from adapters.wittgenstein import fetch_education_projections
from analysis.models import (
    AdjacentSkill,
    DigitalAccessCalibration,
    ReadinessResult,
    SkillProvenance,
    SkillsProfile,
    TaskRisk,
)
from config.models import CountryConfig

# ── Provenance engine ─────────────────────────────────────────────────────────

# Evidence phrase → inferred skills (deterministic extraction)
_EVIDENCE_SKILL_MAP: dict[str, list[str]] = {
    "repair": ["phone_repair", "electronics", "diagnosis"],
    "phone": ["phone_repair", "customer_service"],
    "coding": ["basic_coding", "problem_solving"],
    "code": ["basic_coding", "problem_solving"],
    "programming": ["basic_coding", "problem_solving"],
    "language": ["multilingual"],
    "languages": ["multilingual"],
    "negotiat": ["customer_service", "management"],
    "supplier": ["management", "customer_service"],
    "customer": ["customer_service"],
    "client": ["customer_service"],
    "teach": ["teaching"],
    "train": ["teaching"],
    "farm": ["farming"],
    "agricult": ["farming"],
    "sew": ["sewing"],
    "weld": ["welding"],
    "driv": ["driving"],
    "book": ["bookkeeping"],
    "account": ["bookkeeping"],
    "data": ["data_entry"],
    "social media": ["social_media"],
    "manag": ["management"],
    "supervis": ["management"],
}

_SKILL_TASK_MAP: dict[str, str] = {
    "phone_repair": "non_routine_manual",
    "electronics": "non_routine_manual",
    "diagnosis": "non_routine_cognitive_analytical",
    "basic_coding": "non_routine_cognitive_analytical",
    "programming": "non_routine_cognitive_analytical",
    "problem_solving": "non_routine_cognitive_analytical",
    "customer_service": "non_routine_cognitive_interpersonal",
    "multilingual": "non_routine_cognitive_interpersonal",
    "teaching": "non_routine_cognitive_interpersonal",
    "management": "non_routine_cognitive_interpersonal",
    "data_entry": "routine_cognitive",
    "bookkeeping": "routine_cognitive",
    "social_media": "non_routine_cognitive_analytical",
    "assembly": "routine_manual",
    "sewing": "routine_manual",
    "welding": "routine_manual",
    "driving": "routine_manual",
    "farming": "routine_manual",
}

_ADJACENT_SKILLS: dict[str, list[AdjacentSkill]] = {
    "routine_manual": [
        AdjacentSkill(
            skill="Equipment calibration and preventive maintenance",
            rationale="Machines that automate manual tasks still require human oversight and repair.",
            estimated_wage_premium_pct=25.0,
            training_pathway="TVET technical certificate (6–12 months)",
        ),
        AdjacentSkill(
            skill="IoT device setup and maintenance",
            rationale="Proliferation of connected devices requires field technicians across LMICs.",
            estimated_wage_premium_pct=40.0,
            training_pathway="TVET IoT certificate (6 months)",
        ),
    ],
    "routine_cognitive": [
        AdjacentSkill(
            skill="Data interpretation and reporting",
            rationale="Processing data is being automated; interpreting it for decisions is not.",
            estimated_wage_premium_pct=35.0,
            training_pathway="Online data literacy course (3 months)",
        ),
        AdjacentSkill(
            skill="Customer relationship management",
            rationale="Routine processing automates; client-facing trust work does not.",
            estimated_wage_premium_pct=15.0,
            training_pathway="On-the-job experience + short course",
        ),
    ],
    "non_routine_manual": [
        AdjacentSkill(
            skill="Solar/renewable energy installation",
            rationale="Fastest-growing technical sector across Sub-Saharan Africa and South Asia.",
            estimated_wage_premium_pct=30.0,
            training_pathway="Certified installer training (3 months)",
        ),
        AdjacentSkill(
            skill="AI-assisted diagnostics and repair",
            rationale="Technicians who use AI tools for fault diagnosis command higher wages.",
            estimated_wage_premium_pct=45.0,
            training_pathway="Short digital-tools course (1 month)",
        ),
    ],
}


def _build_provenance(profile: SkillsProfile) -> list[SkillProvenance]:
    """Generate provenance cards for each skill, using work_history as evidence."""
    provenance: list[SkillProvenance] = []
    seen: set[str] = set()

    # From work_history (higher confidence)
    for hist in profile.work_history:
        hist_lower = hist.lower()
        for keyword, skills in _EVIDENCE_SKILL_MAP.items():
            if keyword in hist_lower:
                for skill in skills:
                    if skill not in seen:
                        seen.add(skill)
                        provenance.append(SkillProvenance(
                            skill=skill,
                            evidence=f"Inferred from: \"{hist[:120]}\"",
                            confidence="high",
                            source="work_history",
                        ))

    # From self-reported skills (medium confidence)
    for skill in profile.skills:
        if skill not in seen:
            seen.add(skill)
            provenance.append(SkillProvenance(
                skill=skill,
                evidence="Self-reported — awaiting evidence corroboration.",
                confidence="medium",
                source="self_reported",
            ))

    # From occupation inference (low confidence)
    occupation_inferred = _infer_from_occupation(profile.occupation_isco)
    for skill in occupation_inferred:
        if skill not in seen:
            seen.add(skill)
            provenance.append(SkillProvenance(
                skill=skill,
                evidence=f"Commonly associated with ISCO {profile.occupation_isco} — not individually verified.",
                confidence="low",
                source="occupation_inference",
            ))

    return provenance


def _infer_from_occupation(isco_code: str) -> list[str]:
    isco_skill_map: dict[str, list[str]] = {
        "74": ["electronics", "diagnosis"],
        "25": ["basic_coding", "problem_solving"],
        "52": ["customer_service"],
        "61": ["farming"],
        "41": ["data_entry", "bookkeeping"],
        "53": ["customer_service", "teaching"],
    }
    sub_major = isco_code[:2] if len(isco_code) >= 2 else isco_code[0]
    return isco_skill_map.get(sub_major, [])


def _skill_durability(provenance: list[SkillProvenance], task_profile: dict) -> tuple[list[str], list[str]]:
    durable, vulnerable = [], []
    for p in provenance:
        cat = _SKILL_TASK_MAP.get(p.skill.lower().replace(" ", "_"), "")
        if "non_routine" in cat:
            durable.append(p.skill)
        elif "routine" in cat:
            vulnerable.append(p.skill)
        else:
            durable.append(p.skill)

    high_routine = any(v > 0.65 for k, v in task_profile.items() if "routine" in k and "non_" not in k)
    if high_routine and not vulnerable:
        vulnerable.append("High routine task content in occupation (see task breakdown)")

    return durable or ["Critical thinking", "Problem solving"], vulnerable


def _risk_label(score: float) -> tuple[str, str]:
    if score < 0.25:
        return "low", "long_term"
    elif score < 0.45:
        return "moderate", "10_years"
    elif score < 0.65:
        return "high", "5_years"
    return "very_high", "immediate"


def _get_adjacent(task_profile: dict) -> list[AdjacentSkill]:
    top = sorted(
        [(k, v) for k, v in task_profile.items() if "routine" in k],
        key=lambda x: x[1], reverse=True,
    )
    suggestions: list[AdjacentSkill] = []
    seen: set[str] = set()
    for task_type, _ in top[:2]:
        for s in _ADJACENT_SKILLS.get(task_type, []):
            if s.skill not in seen:
                suggestions.append(s)
                seen.add(s.skill)
    return suggestions[:4]


async def run_readiness(profile: SkillsProfile, country_config: CountryConfig) -> ReadinessResult:
    fallback_used = False

    # ── 1. ILO GenAI 2025 exposure (primary) ─────────────────────────────────
    genai = get_genai_entry(profile.occupation_isco)
    structural_exposure: float = genai["exposure"]
    fallback_used = fallback_used or genai.get("fallback_used", False)

    # ── 2. Frey-Osborne (legacy comparator) ──────────────────────────────────
    fo_entry = get_automation_entry(profile.occupation_isco)
    fo_score: float = fo_entry["raw_score"] if fo_entry else 0.50
    task_profile: dict = fo_entry.get("tasks", {}) if fo_entry else {}
    occupation_label: str = fo_entry["label"] if fo_entry else genai["label"]

    # ── 3. Digital access (ITU + WDI) ────────────────────────────────────────
    digital_data = await get_digital_access(country_config.wdi_country_code)
    digital_composite: float = digital_data.get("composite", 0.35)

    # ILO-WBG LatAm finding: up to 50% of exposed jobs bottlenecked by connectivity
    # Formula: feasibility_factor = 0.5 + 0.5 × digital_composite
    bottleneck_factor = 0.5 + 0.5 * digital_composite

    # ── 4. LMIC calibration (from CountryConfig) ──────────────────────────────
    cal = country_config.automation_calibration
    sector = _get_isic_for_isco(profile.occupation_isco)
    sector_adj = 0.7 if sector in cal.protected_sectors else (
        1.1 if sector in cal.high_risk_sectors else 1.0
    )
    infra_adj = 1.0 - 0.15 * (1.0 - cal.infrastructure_index)

    near_term_feasibility = min(1.0,
        structural_exposure
        * cal.lmic_discount_factor
        * infra_adj
        * sector_adj
        * bottleneck_factor
    )

    # ── 5. Education projections ──────────────────────────────────────────────
    edu_projection = await fetch_education_projections(
        country_config.country_code,
        scenario=country_config.wittgenstein_scenario,
    )
    if not edu_projection.get("available"):
        fallback_used = True

    # ── 6. Provenance + skills ────────────────────────────────────────────────
    provenance = _build_provenance(profile)
    durable, vulnerable = _skill_durability(provenance, task_profile)
    adjacent = _get_adjacent(task_profile)

    task_labels = {
        "routine_manual": "Routine manual tasks",
        "routine_cognitive": "Routine cognitive tasks",
        "non_routine_manual": "Non-routine manual tasks",
        "non_routine_cognitive_analytical": "Non-routine analytical tasks",
        "non_routine_cognitive_interpersonal": "Non-routine interpersonal tasks",
    }
    task_breakdown = [
        TaskRisk(task_type=k, score=v, label=task_labels.get(k, k))
        for k, v in task_profile.items()
    ]

    feas_cat, feas_horizon = _risk_label(near_term_feasibility)

    return ReadinessResult(
        occupation_label=occupation_label,
        occupation_isco=profile.occupation_isco,
        structural_exposure=round(structural_exposure, 3),
        genai_complementarity=round(genai["complementarity"], 3),
        genai_category=genai["category"],
        genai_category_description=CATEGORY_DESCRIPTIONS.get(genai["category"], ""),
        near_term_feasibility=round(near_term_feasibility, 3),
        feasibility_category=feas_cat,
        feasibility_horizon=feas_horizon,
        legacy_fo_score=round(fo_score, 3),
        digital_access=DigitalAccessCalibration(
            internet_pct=digital_data.get("internet_pct"),
            composite_score=digital_composite,
            ilo_latam_bottleneck_factor=round(bottleneck_factor, 3),
            source=digital_data.get("source", "embedded"),
        ),
        calibration_breakdown={
            "lmic_discount_factor": cal.lmic_discount_factor,
            "infrastructure_index": cal.infrastructure_index,
            "infra_adjustment": round(infra_adj, 3),
            "sector_isic": sector,
            "sector_adjustment": sector_adj,
            "digital_bottleneck_factor": round(bottleneck_factor, 3),
            "formula": "structural × lmic_discount × infra_adj × sector_adj × bottleneck",
        },
        task_breakdown=task_breakdown,
        skills_with_provenance=provenance,
        durable_skills=durable,
        vulnerable_skills=vulnerable,
        adjacent_skills=adjacent,
        education_projection=edu_projection,
        data_sources=[
            "ILO Working Paper 140 (2024) — GenAI occupational exposure (primary)",
            "ILO-WBG Latin America (2024) — digital access bottleneck finding",
            "ITU DataHub 2023 — digital connectivity",
            "Frey & Osborne (2013) — Oxford Martin School (legacy comparator)",
            "Wittgenstein Centre SSP2 projections (2023)",
        ],
        fallback_used=fallback_used,
    )


def _get_isic_for_isco(isco_code: str) -> str:
    major = isco_code[0] if isco_code else "9"
    return {"1": "M", "2": "M", "3": "C", "4": "K", "5": "G",
             "6": "A", "7": "C", "8": "C", "9": "S", "0": "O"}.get(major, "G")
