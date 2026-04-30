import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    podcasts = relationship("Podcast", back_populates="user", cascade="all, delete-orphan")
    listening_events = relationship("ListeningEvent", back_populates="user", cascade="all, delete-orphan")
    playback_positions = relationship("PlaybackPosition", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

class Podcast(Base):
    __tablename__ = "podcasts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    feed_url = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    author = Column(String, nullable=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="podcasts")
    episodes = relationship("Episode", back_populates="podcast", cascade="all, delete-orphan")

class Episode(Base):
    __tablename__ = "episodes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    podcast_id = Column(String, ForeignKey("podcasts.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    audio_url = Column(String, nullable=False)
    duration = Column(Integer, nullable=True)
    published_at = Column(DateTime, nullable=True)
    guid = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    podcast = relationship("Podcast", back_populates="episodes")

class ListeningEvent(Base):
    __tablename__ = "listening_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    episode_id = Column(String, nullable=False)
    podcast_id = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    position_seconds = Column(Integer, default=0)
    playback_rate = Column(Float, default=1.0)
    session_id = Column(String, nullable=False)
    
    user = relationship("User", back_populates="listening_events")

class PlaybackPosition(Base):
    __tablename__ = "playback_positions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    episode_id = Column(String, nullable=False)
    position_seconds = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="playback_positions")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="refresh_tokens")