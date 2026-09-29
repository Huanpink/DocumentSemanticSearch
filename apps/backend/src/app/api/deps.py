"""Shared FastAPI dependencies (DI)."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db as _get_db

# Re-export so routes use a single import path.
DbSession = Annotated[AsyncSession, Depends(_get_db)]
