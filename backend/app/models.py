"""Database models."""
from datetime import datetime, timezone
from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    display_name = db.Column(db.String(100))
    avatar_emoji = db.Column(db.String(8), default="🤖")
    preferences = db.Column(db.Text, default="{}")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    sessions = db.relationship('ConversationSession', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_public_dict(self):
        return {"id": self.id, "username": self.username, "display_name": self.display_name, "avatar_emoji": self.avatar_emoji, "preferences": self.preferences}

class ConversationSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), default="New conversation")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    message_count = db.Column(db.Integer, default=0)
    dominant_emotion = db.Column(db.String(50))
    is_archived = db.Column(db.Boolean, default=False)
    
    messages = db.relationship('Message', backref='session', lazy=True, cascade="all, delete-orphan", order_by="Message.created_at")

    def to_dict(self):
        return {"id": self.id, "title": self.title, "created_at": self.created_at.isoformat(), "updated_at": self.updated_at.isoformat(), "message_count": self.message_count, "dominant_emotion": self.dominant_emotion}

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('conversation_session.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False) 
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    primary_emotion = db.Column(db.String(50))
    visual_emotion = db.Column(db.String(50), default="neutral")
    emotion_scores = db.Column(db.Text) 
    sentiment = db.Column(db.String(20))
    sentiment_score = db.Column(db.Float)
    intensity = db.Column(db.Float)

    def to_dict(self):
        return {"id": self.id, "role": self.role, "content": self.content, "created_at": self.created_at.isoformat(), "emotion": {"primary": self.primary_emotion, "visual": self.visual_emotion, "sentiment": self.sentiment}}