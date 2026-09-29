"""API v1 router — aggregate all v1 endpoints here."""

from fastapi import APIRouter

router = APIRouter(tags=["v1"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok"}
