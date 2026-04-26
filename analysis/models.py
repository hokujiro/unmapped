from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from config.models import EducationLevel


# ── Shared input ───────────────────────────────────────────────────────────────

class SkillsProfile(BaseModel):
    user_id: str | None = None
    country_code: str = Field(description="ISO 3166-1 alpha-3, must be registered in /config.")
    occupation_isco: str = Field(description="ISCO-08 4-digit code.", examples=["7421"])
    education_level: EducationLevel
    skills: list[str] = Field(default_factory=list)
    work_history: list[str] = Field(
        default_factory=list,
        description="Free-text evidence descriptions — 'ran phone repair stall for 5 years, handled supplier negotiations'",
    )
    languages: list[str] = Field(default_factory=list, description="Languages spoken, e.g. ['en','tw']")
    years_experience: int | None = Field(default=None, ge=0)
    age: int | None = Field(default=None, ge=10, le=80)
    is_urban: bool = True
    digital_access_level: str = Field(default="mobile_only", description="'none'|'mobile_only'|'broadband'")


# ── Readiness ─────────────────────────────────────────────────────────────────

class TaskRisk(BaseModel):
    task_type: str
    score: float = Field(ge=0.0, le=1.0)
    label: str


class AdjacentSkill(BaseModel):
    skill: str
    rationale: str
    estimated_wage_premium_pct: float | None = None
    training_pathway: str | None = None


class SkillProvenance(BaseModel):
    """Every inferred skill backed by evidence — the 'provenance card' the jury wants."""
    skill: str
    evidence: str = Field(description="Human-readable explanation of why this skill was inferred.")
    confidence: str = Field(description="'high'|'medium'|'low'")
    source: str = Field(description="'work_history'|'self_reported'|'occupation_inference'")


class DigitalAccessCalibration(BaseModel):
    internet_pct: float | None
    composite_score: float
    ilo_latam_bottleneck_factor: float = Field(
        description=(
            "ILO-WBG Latin America finding: up to 50% of exposed jobs are bottlenecked "
            "by digital access gaps. Factor = 0.5 + 0.5 × digital_composite."
        )
    )
    source: str


class ReadinessResult(BaseModel):
    occupation_label: str
    occupation_isco: str

    # ── Primary score: ILO GenAI 2025 ────────────────────────────────────────
    structural_exposure: float = Field(
        description="ILO WP140 (2024): share of tasks where GenAI can substitute. Primary signal."
    )
    genai_complementarity: float = Field(
        description="ILO WP140: share of tasks where GenAI amplifies the worker."
    )
    genai_category: str = Field(description="'high'|'complemented'|'moderate'|'low'")
    genai_category_description: str

    # ── Near-term feasibility (LMIC calibration) ──────────────────────────────
    near_term_feasibility: float = Field(
        description=(
            "Structural exposure adjusted for: LMIC discount, digital access, "
            "employer adoption constraints, infrastructure. This is the actionable score."
        )
    )
    feasibility_category: str
    feasibility_horizon: str

    # ── Legacy comparator ─────────────────────────────────────────────────────
    legacy_fo_score: float = Field(
        description="Frey-Osborne (2013) — retained as legacy comparator only. Do not use as primary."
    )

    # ── Calibration transparency ──────────────────────────────────────────────
    digital_access: DigitalAccessCalibration
    calibration_breakdown: dict[str, Any]

    # ── Task composition ──────────────────────────────────────────────────────
    task_breakdown: list[TaskRisk]

    # ── Skills with provenance ────────────────────────────────────────────────
    skills_with_provenance: list[SkillProvenance]
    durable_skills: list[str]
    vulnerable_skills: list[str]
    adjacent_skills: list[AdjacentSkill]

    # ── Education projection ──────────────────────────────────────────────────
    education_projection: dict[str, Any]

    data_sources: list[str]
    fallback_used: bool


# ── Matching ──────────────────────────────────────────────────────────────────

class OpportunityScoreBreakdown(BaseModel):
    """5-component visible scoring — every component shown to the user."""
    skill_fit: float = Field(ge=0, le=1, description="Overlap between profile skills and required skills.")
    reachability: float = Field(ge=0, le=1, description="Education + location + access constraints.")
    income_signal: float = Field(ge=0, le=1, description="Wage floor relative to country median.")
    sector_signal: float = Field(ge=0, le=1, description="Sector employment growth trajectory.")
    resilience_uplift: float = Field(ge=0, le=1, description="How much this reduces automation exposure.")
    composite: float = Field(ge=0, le=1)
    weights: dict[str, float]


class Opportunity(BaseModel):
    title: str
    isco_code: str
    opportunity_type: str
    sector_isic: str
    sector_label: str

    wage_floor_local: float | None = None
    wage_floor_usd: float | None = None
    sector_employment_growth_pct: float | None = None

    score_breakdown: OpportunityScoreBreakdown
    skill_gap: list[str] = Field(default_factory=list)
    realism_note: str
    data_confidence: str

    # Tavily discovery fields (optional)
    source_type: str = Field(default="official_data", description="'official_data'|'tavily_discovery'")
    source_url: str | None = None
    source_snippet: str | None = None

    # WBL overlay (optional, for women-specific constraints)
    wbl_note: str | None = None


class EconometricSignals(BaseModel):
    wage_data: dict[str, Any] | None
    sector_employment_growth: dict[str, Any] | None
    youth_unemployment_rate: float | None
    self_employed_share: float | None
    human_capital_index: float | None
    digital_access_composite: float | None
    wbl_score: float | None = None
    data_year: str | None
    sources: list[str]


class SkillsSupplyView(BaseModel):
    dominant_isco_cluster: str
    education_level_distribution: dict[str, float]
    top_skills: list[str]
    languages: list[str]


class OpportunityDemandView(BaseModel):
    highest_growth_sectors: list[dict[str, Any]]
    critical_skill_gaps: list[str]
    formality_share: float | None


class Divergence2035View(BaseModel):
    """
    Compare WCDE education trajectory with labour demand by skill level.
    This is the 'policy story': credential supply rising, but signal-ready skills lagging.
    """
    education_trajectory: dict[str, float]  # year → % upper_secondary+
    labour_demand_trajectory: dict[str, str]  # year → demand level
    divergence_gap: str  # "widening" | "stable" | "converging"
    projected_credential_surplus: str
    interpretation: str
    wcde_scenario: str


class PolicymakerView(BaseModel):
    total_profiles_analyzed: int = 1
    skills_supply: SkillsSupplyView
    opportunity_demand: OpportunityDemandView
    divergence_2035: Divergence2035View
    recommended_interventions: list[str]
    aggregate_econometric_signals: EconometricSignals


class MatchingResult(BaseModel):
    opportunities: list[Opportunity]
    econometric_signals: EconometricSignals
    policymaker_view: PolicymakerView | None = None
    country_context_summary: dict[str, Any]
    tavily_enabled: bool = False
    data_sources: list[str]
    fallback_used: bool
