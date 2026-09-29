"""Application settings loaded from environment variables."""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration — values come from env vars / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────
    APP_ENV: str = "development"
    APP_DEBUG: bool = False

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/app"

    @field_validator("DATABASE_URL")
    @classmethod
    def clean_database_url(cls, v: str) -> str:
        if "@tcp://" in v:
            v = v.replace("@tcp://", "@")
        return v

    # ── JWT ──────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-in-production"  # noqa: S105
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"


settings = Settings()
