import os
from app import create_app, db

# Default to production if not specified to ensure secure cookies trigger
app = create_app(os.getenv("FLASK_ENV", "production"))

# Safely initialize the database tables before the server starts accepting requests
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 10000)))