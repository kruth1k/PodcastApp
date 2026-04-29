import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Podcast(Base):
    __tablename__ = "podcasts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    feed_url = Column(String, unique=True, nullable=False)
    image_url = Column(String, nullable=True)
    author = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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