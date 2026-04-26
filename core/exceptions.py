from fastapi import HTTPException


class CountryNotConfigured(HTTPException):
    def __init__(self, country_code: str):
        super().__init__(
            status_code=404,
            detail=f"Country '{country_code}' has no configuration. POST /config/countries first.",
        )


class DataSourceUnavailable(HTTPException):
    def __init__(self, source: str, detail: str = ""):
        super().__init__(
            status_code=502,
            detail=f"Data source '{source}' unavailable. {detail}".strip(),
        )


class InvalidOccupation(HTTPException):
    def __init__(self, isco_code: str):
        super().__init__(
            status_code=422,
            detail=f"ISCO code '{isco_code}' not found in automation database.",
        )
