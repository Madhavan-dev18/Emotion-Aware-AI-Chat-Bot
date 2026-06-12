# ── CORS CONFIGURATION ────────────────────────────────────────────────
    origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    allowed_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

    vercel_origin_regex = r"^https://havan-a-emotion-aware-chat-assistant[\w-]*\.vercel\.app$"

    # supports_credentials is gone. Headers are allowed.
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins + [re.compile(vercel_origin_regex)],
            }
        },
        allow_headers=["Content-Type", "Authorization"],
    )