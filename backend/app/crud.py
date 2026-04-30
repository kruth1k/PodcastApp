from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from datetime import datetime
import uuid

def create_podcast(db: Session, podcast_data: dict) -> models.Podcast:
    podcast = models.Podcast(
        id=str(uuid.uuid4()),
        title=podcast_data["title"],
        description=podcast_data.get("description"),
        feed_url=podcast_data["feed_url"],
        image_url=podcast_data.get("image_url"),
        author=podcast_data.get("author"),
        user_id=podcast_data.get("user_id")
    )
    db.add(podcast)
    db.commit()
    db.refresh(podcast)
    return podcast

def get_podcasts(db: Session) -> List[models.Podcast]:
    return db.query(models.Podcast).options(joinedload(models.Podcast.episodes)).order_by(models.Podcast.created_at.desc()).all()

def get_podcasts_for_user(db: Session, user_id: Optional[str] = None) -> List[models.Podcast]:
    if user_id:
        return db.query(models.Podcast).filter(
            models.Podcast.user_id == user_id
        ).options(joinedload(models.Podcast.episodes)).order_by(models.Podcast.created_at.desc()).all()
    else:
        return db.query(models.Podcast).filter(
            models.Podcast.user_id == None
        ).options(joinedload(models.Podcast.episodes)).order_by(models.Podcast.created_at.desc()).all()

def get_podcast(db: Session, podcast_id: str) -> Optional[models.Podcast]:
    return db.query(models.Podcast).filter(models.Podcast.id == podcast_id).first()

def delete_podcast(db: Session, podcast_id: str) -> bool:
    podcast = db.query(models.Podcast).filter(models.Podcast.id == podcast_id).first()
    if podcast:
        db.delete(podcast)
        db.commit()
        return True
    return False

def get_episodes(db: Session, podcast_id: str) -> List[models.Episode]:
    return db.query(models.Episode).filter(
        models.Episode.podcast_id == podcast_id
    ).order_by(models.Episode.published_at.desc()).all()

def create_episode(db: Session, podcast_id: str, episode_data: dict) -> models.Episode:
    episode = models.Episode(
        id=str(uuid.uuid4()),
        podcast_id=podcast_id,
        title=episode_data["title"],
        description=episode_data.get("description"),
        audio_url=episode_data["audio_url"],
        duration=episode_data.get("duration"),
        published_at=episode_data.get("published_at"),
        guid=episode_data["guid"]
    )
    db.add(episode)
    return episode

def create_episodes_bulk(db: Session, podcast_id: str, episodes_data: List[dict]) -> None:
    for episode_data in episodes_data:
        episode = create_episode(db, podcast_id, episode_data)
        db.add(episode)
    db.commit()