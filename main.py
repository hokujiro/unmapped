"""
UNMAPPED API — Open Skills & Economic Opportunity Infrastructure
World Bank Youth Summit × Hack-Nation · Global AI Hackathon 2026

Architecture: Modular FastAPI monolith
  /config      → Country configuration layer (plug-in data sources per country)
  /analysis/readiness  → Module 02: AI Readiness & Displacement Risk
  /analysis/matching   → Module 03: Opportunity Matching & Econometric Dashboard
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analysis.router import router as analysis_router
from config.router import router as config_router

app = FastAPI(
    title="UNMAPPED API",
    description=(
        "Open, localizable infrastructure layer connecting youth skills profiles "
        "to real economic opportunity. Configurable per country — no hardcoded assumptions."
    ),
    version="0.1.0",
    contact={"name": "UNMAPPED", "email": "p.orozcomora@gmail.com"},
    license_info={"name": "MIT"},
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config_router)
app.include_router(analysis_router)


@app.get("/", include_in_schema=False)
def root():
    return {
        "service": "UNMAPPED API",
        "version": "0.1.0",
        "docs": "/docs",
        "modules": {
            "config": "/config/countries",
            "readiness": "/analysis/readiness",
            "matching": "/analysis/matching",
        },
        "pre_configured_countries": ["GHA", "BGD"],
    }


@app.get("/health", tags=["Meta"])
def health():
    return {"status": "ok"}
