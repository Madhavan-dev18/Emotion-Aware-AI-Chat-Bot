import os
from app import create_app, db

app = create_app(os.getenv("FLASK_ENV", "development"))

# Destroy any inherited connections before Gunicorn workers take over.
# This forces fresh, uncorrupted SSL handshakes for every worker.
with app.app_context():
    db.engine.dispose()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 10000)))