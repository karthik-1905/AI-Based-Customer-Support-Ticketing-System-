"""
Application configuration using pydantic-settings.
Loads values from .env file (or environment variables).
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # -----------------------------------------------------------------------
    # Database
    # -----------------------------------------------------------------------
    DATABASE_URL: str = "sqlite+aiosqlite:///./recruitai.db"

    # -----------------------------------------------------------------------
    # JWT / Auth
    # -----------------------------------------------------------------------
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string-32+"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # -----------------------------------------------------------------------
    # File uploads
    # -----------------------------------------------------------------------
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # -----------------------------------------------------------------------
    # CORS
    # -----------------------------------------------------------------------
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # -----------------------------------------------------------------------
    # App meta
    # -----------------------------------------------------------------------
    APP_NAME: str = "RecruitAI"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        # Allow comma-separated list for CORS_ORIGINS from env
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
