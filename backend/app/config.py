from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Universal Translator API"
    api_prefix: str = "/api/v1"
    cors_origins: str = "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5180,http://localhost:5180"
    cors_origin_regex: str = r"http://(127\.0\.0\.1|localhost)(:\d+)?"

    # LLM: mock | cntokenworld | openai | custom
    llm_provider: str = "mock"
    llm_api_key: str = ""
    llm_base_url: str = "https://www.cntokenworld.com/api/aistore/v1"
    llm_model: str = "neice-glm5.1"
    llm_timeout_seconds: float = 90.0
    game_embed_path: str = "/game/room.html"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
