from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openrouter_api_key: str = Field(default="", alias="OPENROUTER_API_KEY")
    grok_api_key: str = Field(default="", alias="GROK_API_KEY")
    openrouter_model: str = Field(default="x-ai/grok-3", alias="OPENROUTER_MODEL")

    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: int = Field(default=3306, alias="DB_PORT")
    db_name: str = Field(default="viet_law_rag", alias="DB_NAME")
    db_user: str = Field(default="raguser", alias="DB_USER")
    db_password: str = Field(default="", alias="DB_PASSWORD")

    embed_model: str = Field(default="BAAI/bge-m3", alias="EMBED_MODEL")
    embed_dim: int = Field(default=1024, alias="EMBED_DIM")

    log_level: str = Field(default="INFO", alias="LOG_LEVEL")


@lru_cache
def get_settings() -> Settings:
    return Settings()
