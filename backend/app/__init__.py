"""
MoodLens — Emotion-Aware AI Chat
Flask application factory.
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
import logging
import os

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "60 per hour"])

def create_app(config_name: str = "development") -> Flask:
    app = Flask(__name__)

    # ── Proxy Fix for Rate Limiting ──────────────────────────────────────
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    from app.config import config_map
    app.config.from_object(config_map[config_name])

    # ── Extensions ───────────────────────────────────────────────────────
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    
    # ── NEW CORS CONFIGURATION ───────────────────────────────────────────
    # Parse comma-separated origins from the environment variable
    origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    allowed_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

    # supports_credentials=True is MANDATORY when frontend uses withCredentials: true
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

    # ── Logging ──────────────────────────────────────────────────────────
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # ── Blueprints ───────────────────────────────────────────────────────
    from app.routes.auth import auth_bp
    from app.routes.chat import chat_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")

    return app