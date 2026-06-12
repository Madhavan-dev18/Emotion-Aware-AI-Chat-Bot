import os
from datetime import timedelta

class Config:
    """Base configuration."""
    # ── App Security ─────────────────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-fallback-key")

    # ── Database Configuration ───────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///moodlens.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── LLM / AI Configuration ───────────────────────────────────────────
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    MAX_MEMORY_TURNS = int(os.getenv("MAX_MEMORY_TURNS", 10))

    # ── Base JWT Configuration ───────────────────────────────────────────
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-super-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # ── JWT Cookie Configuration (HTTPOnly XSS Protection) ───────────────
    JWT_TOKEN_LOCATION = ["cookies"]
    # Default to False for local development over HTTP. Overridden in Production.
    JWT_COOKIE_SECURE = False 
    JWT_ACCESS_COOKIE_PATH = '/api/'
    JWT_REFRESH_COOKIE_PATH = '/api/auth/refresh'
    # Note: Disabled for this rapid patch to avoid frontend header overhead.
    # Enable this in the future to protect against Cross-Site Request Forgery.
    JWT_COOKIE_CSRF_PROTECT = False


class DevelopmentConfig(Config):
    """Development environment settings."""
    DEBUG = True


class ProductionConfig(Config):
    """Production environment settings."""
    DEBUG = False
    
    # MUST BE TRUE IN PRODUCTION. Tells the browser to only send cookies over HTTPS.
    JWT_COOKIE_SECURE = True 
    
    # Prevents dropped connections in production (replaces the old run.py hack)
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }


# Maps the string names to the actual objects so __init__.py can load them dynamically
config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}