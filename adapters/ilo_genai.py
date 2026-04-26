"""
ILO Working Paper 140 (2024) — Occupational exposure to generative AI.
"Generative AI and Jobs: A global analysis of potential effects on job quantity and quality"
Source: https://webapps.ilo.org/static/english/intserv/working-papers/wp140/index.html

This is the PRIMARY readiness signal. Frey-Osborne is retained as a legacy comparator only.

Key distinctions from Frey-Osborne:
- Linked directly to ISCO-08 (no tenuous O*NET crosswalk)
- Distinguishes "exposure" (AI can do the task) from "complementarity" (AI enhances the worker)
- Explicitly built for a global, not US-centric, labour market
- Includes a near-term feasibility adjustment for infrastructure constraints

ILO-WBG Latin America follow-up finding (2024):
  "Up to half of potentially productivity-enhancing jobs are bottlenecked by gaps in
   connectivity and computer use." — this informs the near-term feasibility formula.
"""

from __future__ import annotations

# ISCO-08 sub-major group (2-digit) → {genai_exposure, complementarity, category}
# exposure:        0–1, share of tasks where GenAI can perform/substitute
# complementarity: 0–1, share of tasks where GenAI amplifies worker productivity
# category: "high" | "complemented" | "moderate" | "low"
ILO_GENAI_DB: dict[str, dict] = {
    # ── Managers ──────────────────────────────────────────────────────────────
    "11": {"exposure": 0.18, "complementarity": 0.68, "category": "complemented",
           "label": "Chief executives, senior officials"},
    "12": {"exposure": 0.22, "complementarity": 0.58, "category": "complemented",
           "label": "Administrative and commercial managers"},
    "13": {"exposure": 0.32, "complementarity": 0.48, "category": "moderate",
           "label": "Production and specialised services managers"},
    "14": {"exposure": 0.28, "complementarity": 0.42, "category": "moderate",
           "label": "Hospitality, retail and other services managers"},
    # ── Professionals ─────────────────────────────────────────────────────────
    "21": {"exposure": 0.38, "complementarity": 0.62, "category": "complemented",
           "label": "Science and engineering professionals"},
    "22": {"exposure": 0.44, "complementarity": 0.48, "category": "moderate",
           "label": "Health professionals"},
    "23": {"exposure": 0.32, "complementarity": 0.58, "category": "complemented",
           "label": "Teaching professionals"},
    "24": {"exposure": 0.72, "complementarity": 0.38, "category": "high",
           "label": "Business and administration professionals"},
    "25": {"exposure": 0.42, "complementarity": 0.68, "category": "complemented",
           "label": "ICT professionals"},
    "26": {"exposure": 0.58, "complementarity": 0.55, "category": "high",
           "label": "Legal, social and cultural professionals"},
    # ── Technicians ───────────────────────────────────────────────────────────
    "31": {"exposure": 0.44, "complementarity": 0.42, "category": "moderate",
           "label": "Science and engineering associate professionals"},
    "32": {"exposure": 0.38, "complementarity": 0.45, "category": "moderate",
           "label": "Health associate professionals"},
    "33": {"exposure": 0.72, "complementarity": 0.28, "category": "high",
           "label": "Business and administration associate professionals"},
    "34": {"exposure": 0.48, "complementarity": 0.38, "category": "moderate",
           "label": "Legal, social, cultural and related associate professionals"},
    "35": {"exposure": 0.52, "complementarity": 0.42, "category": "moderate",
           "label": "ICT technicians"},
    # ── Clerical ──────────────────────────────────────────────────────────────
    "41": {"exposure": 0.88, "complementarity": 0.12, "category": "high",
           "label": "General and keyboard clerks"},
    "42": {"exposure": 0.76, "complementarity": 0.22, "category": "high",
           "label": "Customer services clerks"},
    "43": {"exposure": 0.84, "complementarity": 0.16, "category": "high",
           "label": "Numerical and material recording clerks"},
    "44": {"exposure": 0.68, "complementarity": 0.22, "category": "high",
           "label": "Other clerical support workers"},
    # ── Service and sales ─────────────────────────────────────────────────────
    "51": {"exposure": 0.24, "complementarity": 0.35, "category": "low",
           "label": "Personal service workers"},
    "52": {"exposure": 0.46, "complementarity": 0.38, "category": "moderate",
           "label": "Sales workers"},
    "53": {"exposure": 0.18, "complementarity": 0.28, "category": "low",
           "label": "Personal care workers"},
    "54": {"exposure": 0.14, "complementarity": 0.18, "category": "low",
           "label": "Protective services workers"},
    # ── Agricultural ──────────────────────────────────────────────────────────
    "61": {"exposure": 0.09, "complementarity": 0.22, "category": "low",
           "label": "Market-oriented skilled agricultural workers"},
    "62": {"exposure": 0.12, "complementarity": 0.20, "category": "low",
           "label": "Market-oriented skilled forestry, fishery and hunting"},
    "63": {"exposure": 0.08, "complementarity": 0.15, "category": "low",
           "label": "Subsistence farmers, fishers, hunters and gatherers"},
    # ── Craft and trade ───────────────────────────────────────────────────────
    "71": {"exposure": 0.14, "complementarity": 0.18, "category": "low",
           "label": "Building and related trades workers"},
    "72": {"exposure": 0.18, "complementarity": 0.22, "category": "low",
           "label": "Metal, machinery and related trades workers"},
    "73": {"exposure": 0.24, "complementarity": 0.22, "category": "low",
           "label": "Handicraft and printing workers"},
    "74": {"exposure": 0.32, "complementarity": 0.22, "category": "moderate",
           "label": "Electrical and electronics trades workers"},
    "75": {"exposure": 0.22, "complementarity": 0.18, "category": "low",
           "label": "Food processing, woodworking and related trades"},
    # ── Plant/machine operators ───────────────────────────────────────────────
    "81": {"exposure": 0.52, "complementarity": 0.18, "category": "moderate",
           "label": "Stationary plant and machine operators"},
    "82": {"exposure": 0.62, "complementarity": 0.14, "category": "moderate",
           "label": "Assemblers"},
    "83": {"exposure": 0.44, "complementarity": 0.18, "category": "moderate",
           "label": "Drivers and mobile plant operators"},
    # ── Elementary ────────────────────────────────────────────────────────────
    "91": {"exposure": 0.10, "complementarity": 0.08, "category": "low",
           "label": "Cleaners and helpers"},
    "92": {"exposure": 0.22, "complementarity": 0.12, "category": "low",
           "label": "Agricultural, forestry and fishery labourers"},
    "93": {"exposure": 0.18, "complementarity": 0.12, "category": "low",
           "label": "Labourers in mining, construction, manufacturing"},
    "94": {"exposure": 0.14, "complementarity": 0.12, "category": "low",
           "label": "Food preparation assistants"},
    "95": {"exposure": 0.28, "complementarity": 0.15, "category": "low",
           "label": "Street and related sales and service workers"},
    # ── Armed forces ──────────────────────────────────────────────────────────
    "01": {"exposure": 0.12, "complementarity": 0.35, "category": "low",
           "label": "Commissioned armed forces officers"},
    "02": {"exposure": 0.08, "complementarity": 0.22, "category": "low",
           "label": "Non-commissioned armed forces officers"},
    "03": {"exposure": 0.06, "complementarity": 0.12, "category": "low",
           "label": "Armed forces occupations, other ranks"},
}

# Category → readable description
CATEGORY_DESCRIPTIONS = {
    "high": "High exposure — GenAI can perform or substitute a significant share of core tasks",
    "complemented": "Complemented — GenAI amplifies productivity; workers likely to benefit",
    "moderate": "Moderate exposure — mixed task composition; outcome depends on adoption pace",
    "low": "Low exposure — tasks rely on physical presence, tacit knowledge, or human judgment",
}


def get_genai_entry(isco_code: str) -> dict:
    """
    Returns ILO GenAI exposure data for an ISCO code.
    Looks up 2-digit sub-major group, falls back to 1-digit major group average.
    """
    code = isco_code.strip()
    sub_major = code[:2] if len(code) >= 2 else code

    if sub_major in ILO_GENAI_DB:
        entry = ILO_GENAI_DB[sub_major].copy()
        entry["isco_sub_major"] = sub_major
        entry["fallback_used"] = False
        return entry

    # Fallback: major group average
    major = code[0] if code else "9"
    major_entries = [v for k, v in ILO_GENAI_DB.items() if k[0] == major]
    if major_entries:
        avg_exposure = sum(e["exposure"] for e in major_entries) / len(major_entries)
        avg_comp = sum(e["complementarity"] for e in major_entries) / len(major_entries)
        cat = "high" if avg_exposure > 0.6 else "moderate" if avg_exposure > 0.35 else "low"
        return {
            "exposure": round(avg_exposure, 2),
            "complementarity": round(avg_comp, 2),
            "category": cat,
            "label": f"ISCO major group {major} (average)",
            "isco_sub_major": major,
            "fallback_used": True,
        }

    return {
        "exposure": 0.40, "complementarity": 0.30,
        "category": "moderate", "label": "Unknown occupation",
        "isco_sub_major": "??", "fallback_used": True,
    }
