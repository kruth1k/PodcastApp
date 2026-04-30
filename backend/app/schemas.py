from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefresh(BaseModel):
    refresh_token: str

class ListeningEventCreate(BaseModel):
    episode_id: str
    podcast_id: str
    event_type: str
    position_seconds: int = 0
    playback_rate: float = 1.0
    session_id: str

class ListeningEventResponse(BaseModel):
    id: str
    user_id: str
    episode_id: str
    podcast_id: str
    event_type: str
    timestamp: datetime
    position_seconds: int
    playback_rate: float
    session_id: str
    
    class Config:
        from_attributes = True

class PlaybackPositionUpdate(BaseModel):
    episode_id: str
    position_seconds: int

class PlaybackPositionResponse(BaseModel):
    id: str
    user_id: str
    episode_id: str
    position_seconds: int
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PodcastCreate(BaseModel):
    feed_url: str

class EpisodeResponse(BaseModel):
    id: str
    podcast_id: Optional[str] = None
    title: str
    description: Optional[str]
    audio_url: str
    duration: Optional[int]
    published_at: Optional[datetime]
    guid: str
    
    class Config:
        from_attributes = True

class PodcastResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    feed_url: str
    image_url: Optional[str]
    author: Optional[str]
    created_at: datetime
    updated_at: datetime
    episodes: List[EpisodeResponse] = []
    
    class Config:
        from_attributes = True

class PodcastListResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    feed_url: str
    image_url: Optional[str]
    author: Optional[str]
    episode_count: int = 0
    
    class Config:
        from_attributes = True