"""
Frey & Osborne (2013) automation probability scores mapped to ISCO-08 4-digit codes.
Source: Oxford Martin School + ILO LMIC calibration (Wold Bank STEP, 2016).

The raw scores reflect US task-composition. The LMIC-calibrated score is computed
downstream in the readiness service using CountryConfig.automation_calibration.
"""

from __future__ import annotations

# ISCO-08 4-digit → (raw_fo_score, task_profile)
# task_profile keys: routine_manual, routine_cognitive, non_routine_manual,
#                    non_routine_cognitive_analytical, non_routine_cognitive_interpersonal
AUTOMATION_DB: dict[str, dict] = {
    # ── Managers ──────────────────────────────────────────────────────────────
    "1120": {"raw_score": 0.03, "label": "Managing directors and chief executives",
             "tasks": {"routine_manual": 0.05, "routine_cognitive": 0.20,
                       "non_routine_cognitive_analytical": 0.85, "non_routine_cognitive_interpersonal": 0.90}},
    "1321": {"raw_score": 0.09, "label": "Manufacturing managers",
             "tasks": {"routine_manual": 0.25, "routine_cognitive": 0.45,
                       "non_routine_cognitive_analytical": 0.70, "non_routine_cognitive_interpersonal": 0.65}},
    # ── Professionals ─────────────────────────────────────────────────────────
    "2153": {"raw_score": 0.04, "label": "Telecommunications engineers",
             "tasks": {"routine_manual": 0.10, "routine_cognitive": 0.35,
                       "non_routine_cognitive_analytical": 0.90, "non_routine_cognitive_interpersonal": 0.40}},
    "2511": {"raw_score": 0.05, "label": "Systems analysts",
             "tasks": {"routine_manual": 0.05, "routine_cognitive": 0.30,
                       "non_routine_cognitive_analytical": 0.95, "non_routine_cognitive_interpersonal": 0.45}},
    "2512": {"raw_score": 0.04, "label": "Software developers",
             "tasks": {"routine_manual": 0.05, "routine_cognitive": 0.25,
                       "non_routine_cognitive_analytical": 0.95, "non_routine_cognitive_interpersonal": 0.40}},
    "2310": {"raw_score": 0.03, "label": "University and higher education teachers",
             "tasks": {"routine_manual": 0.05, "routine_cognitive": 0.30,
                       "non_routine_cognitive_analytical": 0.80, "non_routine_cognitive_interpersonal": 0.90}},
    "2330": {"raw_score": 0.04, "label": "Secondary education teachers",
             "tasks": {"routine_manual": 0.08, "routine_cognitive": 0.35,
                       "non_routine_cognitive_analytical": 0.75, "non_routine_cognitive_interpersonal": 0.88}},
    "2211": {"raw_score": 0.005, "label": "Generalist medical practitioners",
             "tasks": {"routine_manual": 0.10, "routine_cognitive": 0.40,
                       "non_routine_cognitive_analytical": 0.92, "non_routine_cognitive_interpersonal": 0.95}},
    # ── Technicians ───────────────────────────────────────────────────────────
    "3114": {"raw_score": 0.40, "label": "Electronics engineering technicians",
             "tasks": {"routine_manual": 0.55, "routine_cognitive": 0.60,
                       "non_routine_cognitive_analytical": 0.55, "non_routine_cognitive_interpersonal": 0.30}},
    "3122": {"raw_score": 0.35, "label": "Manufacturing supervisors",
             "tasks": {"routine_manual": 0.50, "routine_cognitive": 0.55,
                       "non_routine_cognitive_analytical": 0.50, "non_routine_cognitive_interpersonal": 0.50}},
    "3512": {"raw_score": 0.55, "label": "ICT user support technicians",
             "tasks": {"routine_manual": 0.35, "routine_cognitive": 0.70,
                       "non_routine_cognitive_analytical": 0.55, "non_routine_cognitive_interpersonal": 0.55}},
    # ── Clerical workers ──────────────────────────────────────────────────────
    "4110": {"raw_score": 0.96, "label": "General office clerks",
             "tasks": {"routine_manual": 0.40, "routine_cognitive": 0.95,
                       "non_routine_cognitive_analytical": 0.20, "non_routine_cognitive_interpersonal": 0.25}},
    "4131": {"raw_score": 0.97, "label": "Keyboard operators",
             "tasks": {"routine_manual": 0.30, "routine_cognitive": 0.98,
                       "non_routine_cognitive_analytical": 0.10, "non_routine_cognitive_interpersonal": 0.10}},
    "4211": {"raw_score": 0.97, "label": "Bank tellers",
             "tasks": {"routine_manual": 0.40, "routine_cognitive": 0.95,
                       "non_routine_cognitive_analytical": 0.15, "non_routine_cognitive_interpersonal": 0.35}},
    # ── Service workers ───────────────────────────────────────────────────────
    "5111": {"raw_score": 0.09, "label": "Travel attendants and related",
             "tasks": {"routine_manual": 0.30, "routine_cognitive": 0.40,
                       "non_routine_cognitive_analytical": 0.35, "non_routine_cognitive_interpersonal": 0.85}},
    "5211": {"raw_score": 0.77, "label": "Stall and market salespersons",
             "tasks": {"routine_manual": 0.50, "routine_cognitive": 0.65,
                       "non_routine_cognitive_analytical": 0.20, "non_routine_cognitive_interpersonal": 0.60}},
    "5321": {"raw_score": 0.03, "label": "Health care assistants",
             "tasks": {"routine_manual": 0.45, "routine_cognitive": 0.40,
                       "non_routine_cognitive_analytical": 0.45, "non_routine_cognitive_interpersonal": 0.90}},
    # ── Skilled agricultural workers ──────────────────────────────────────────
    "6111": {"raw_score": 0.70, "label": "Field crop and vegetable growers",
             "tasks": {"routine_manual": 0.80, "routine_cognitive": 0.30,
                       "non_routine_cognitive_analytical": 0.20, "non_routine_cognitive_interpersonal": 0.15}},
    "6130": {"raw_score": 0.55, "label": "Subsistence farmers",
             "tasks": {"routine_manual": 0.75, "routine_cognitive": 0.25,
                       "non_routine_cognitive_analytical": 0.25, "non_routine_cognitive_interpersonal": 0.20}},
    # ── Craft and trade workers ───────────────────────────────────────────────
    "7114": {"raw_score": 0.59, "label": "Concrete placers, structural steel workers",
             "tasks": {"routine_manual": 0.80, "routine_cognitive": 0.25,
                       "non_routine_cognitive_analytical": 0.30, "non_routine_cognitive_interpersonal": 0.15}},
    "7421": {"raw_score": 0.67, "label": "Electronics mechanics, fitters and servicers",
             "tasks": {"routine_manual": 0.70, "routine_cognitive": 0.45,
                       "non_routine_cognitive_analytical": 0.55, "non_routine_cognitive_interpersonal": 0.25}},
    "7422": {"raw_score": 0.62, "label": "ICT equipment mechanics and servicers",
             "tasks": {"routine_manual": 0.60, "routine_cognitive": 0.50,
                       "non_routine_cognitive_analytical": 0.60, "non_routine_cognitive_interpersonal": 0.30}},
    "7511": {"raw_score": 0.50, "label": "Butchers, fishmongers and related",
             "tasks": {"routine_manual": 0.80, "routine_cognitive": 0.30,
                       "non_routine_cognitive_analytical": 0.20, "non_routine_cognitive_interpersonal": 0.25}},
    # ── Plant and machine operators ───────────────────────────────────────────
    "8111": {"raw_score": 0.90, "label": "Mining and quarrying plant operators",
             "tasks": {"routine_manual": 0.90, "routine_cognitive": 0.55,
                       "non_routine_cognitive_analytical": 0.20, "non_routine_cognitive_interpersonal": 0.10}},
    "8160": {"raw_score": 0.95, "label": "Food processing machine operators",
             "tasks": {"routine_manual": 0.95, "routine_cognitive": 0.60,
                       "non_routine_cognitive_analytical": 0.10, "non_routine_cognitive_interpersonal": 0.10}},
    "8331": {"raw_score": 0.78, "label": "Bus and tram drivers",
             "tasks": {"routine_manual": 0.85, "routine_cognitive": 0.40,
                       "non_routine_cognitive_analytical": 0.15, "non_routine_cognitive_interpersonal": 0.30}},
    # ── Elementary occupations ────────────────────────────────────────────────
    "9112": {"raw_score": 0.97, "label": "Domestic cleaners and helpers",
             "tasks": {"routine_manual": 0.90, "routine_cognitive": 0.20,
                       "non_routine_cognitive_analytical": 0.05, "non_routine_cognitive_interpersonal": 0.30}},
    "9333": {"raw_score": 0.94, "label": "Freight handlers",
             "tasks": {"routine_manual": 0.95, "routine_cognitive": 0.30,
                       "non_routine_cognitive_analytical": 0.05, "non_routine_cognitive_interpersonal": 0.10}},
}

# ISCO major-group fallback scores (used when 4-digit code not found)
ISCO_MAJOR_GROUP_FALLBACK: dict[str, float] = {
    "1": 0.10,  # Managers
    "2": 0.07,  # Professionals
    "3": 0.45,  # Technicians and associate professionals
    "4": 0.80,  # Clerical support
    "5": 0.35,  # Service and sales
    "6": 0.65,  # Skilled agricultural
    "7": 0.58,  # Craft and trade
    "8": 0.85,  # Plant and machine operators
    "9": 0.90,  # Elementary
    "0": 0.08,  # Armed forces
}


def get_automation_entry(isco_code: str) -> dict | None:
    """Return full entry for ISCO code, falling back to major-group average."""
    code = isco_code.strip()
    if code in AUTOMATION_DB:
        return {**AUTOMATION_DB[code], "isco_code": code, "fallback_used": False}
    major = code[0] if code else ""
    if major in ISCO_MAJOR_GROUP_FALLBACK:
        return {
            "isco_code": code,
            "raw_score": ISCO_MAJOR_GROUP_FALLBACK[major],
            "label": f"ISCO major group {major} (average)",
            "tasks": {},
            "fallback_used": True,
        }
    return None
