export type EducationLevel =
  | "no_formal" | "primary" | "lower_secondary"
  | "upper_secondary" | "post_secondary" | "tertiary";

export interface SkillsProfile {
  country_code: string;
  occupation_isco: string;
  education_level: EducationLevel;
  skills: string[];
  work_history?: string[];
  languages?: string[];
  age?: number;
  is_urban?: boolean;
  digital_access_level?: "none" | "mobile_only" | "broadband";
}

// ── Readiness ────────────────────────────────────────────────────────────────

export interface TaskRisk { task_type: string; score: number; label: string; }

export interface AdjacentSkill {
  skill: string; rationale: string;
  estimated_wage_premium_pct: number | null; training_pathway: string | null;
}

export interface SkillProvenance {
  skill: string; evidence: string;
  confidence: "high" | "medium" | "low";
  source: "work_history" | "self_reported" | "occupation_inference";
}

export interface DigitalAccessCalibration {
  internet_pct: number | null; composite_score: number;
  ilo_latam_bottleneck_factor: number; source: string;
}

export interface ReadinessResult {
  occupation_label: string; occupation_isco: string;
  // Primary: ILO GenAI 2025
  structural_exposure: number; genai_complementarity: number;
  genai_category: "high" | "complemented" | "moderate" | "low";
  genai_category_description: string;
  // Near-term feasibility (LMIC calibrated)
  near_term_feasibility: number;
  feasibility_category: "low" | "moderate" | "high" | "very_high";
  feasibility_horizon: string;
  // Legacy comparator
  legacy_fo_score: number;
  digital_access: DigitalAccessCalibration;
  calibration_breakdown: Record<string, unknown>;
  task_breakdown: TaskRisk[];
  skills_with_provenance: SkillProvenance[];
  durable_skills: string[]; vulnerable_skills: string[];
  adjacent_skills: AdjacentSkill[];
  education_projection: {
    available: boolean; scenario: string; source: string;
    upper_secondary_plus_pct: Record<string, number>;
    current_pct: number; projected_2035_pct: number;
    absolute_change: number; interpretation: string;
  };
  data_sources: string[]; fallback_used: boolean;
}

// ── Matching ─────────────────────────────────────────────────────────────────

export interface OpportunityScoreBreakdown {
  skill_fit: number; reachability: number; income_signal: number;
  sector_signal: number; resilience_uplift: number;
  composite: number; weights: Record<string, number>;
}

export interface Opportunity {
  title: string; isco_code: string; opportunity_type: string;
  sector_isic: string; sector_label: string;
  wage_floor_local: number | null; wage_floor_usd: number | null;
  sector_employment_growth_pct: number | null;
  score_breakdown: OpportunityScoreBreakdown;
  skill_gap: string[]; realism_note: string; data_confidence: string;
  source_type: string; source_url: string | null; source_snippet: string | null;
  wbl_note: string | null;
}

export interface EconometricSignals {
  wage_data: { mean_monthly_local_currency: number | null; currency: string; year: string | null; note: string } | null;
  sector_employment_growth: Record<string, number> | null;
  youth_unemployment_rate: number | null;
  self_employed_share: number | null;
  human_capital_index: number | null;
  digital_access_composite: number | null;
  wbl_score: number | null;
  data_year: string | null; sources: string[];
}

export interface Divergence2035View {
  education_trajectory: Record<string, number>;
  labour_demand_trajectory: Record<string, string>;
  divergence_gap: "widening" | "stable" | "converging";
  projected_credential_surplus: string;
  interpretation: string; wcde_scenario: string;
}

export interface PolicymakerView {
  total_profiles_analyzed: number;
  skills_supply: {
    dominant_isco_cluster: string;
    education_level_distribution: Record<string, number>;
    top_skills: string[]; languages: string[];
  };
  opportunity_demand: {
    highest_growth_sectors: { sector: string; employment_share_pct: number }[];
    critical_skill_gaps: string[]; formality_share: number | null;
  };
  divergence_2035: Divergence2035View;
  recommended_interventions: string[];
  aggregate_econometric_signals: EconometricSignals;
}

export interface MatchingResult {
  opportunities: Opportunity[];
  econometric_signals: EconometricSignals;
  policymaker_view: PolicymakerView | null;
  country_context_summary: Record<string, unknown>;
  tavily_enabled: boolean;
  data_sources: string[]; fallback_used: boolean;
}

export interface CountryConfigSummary {
  country_code: string; country_name: string;
  region: string; language_code: string; lmic_discount_factor: number;
}
