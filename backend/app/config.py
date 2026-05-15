from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://redis:6379"
    secret_key: str
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    smtp_from: str = "noreply@taskapp.local"
    frontend_url: str = "http://localhost"

    model_config = {"env_file": ".env"}


settings = Settings()
