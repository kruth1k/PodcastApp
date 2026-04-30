from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

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