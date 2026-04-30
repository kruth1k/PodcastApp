from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime
from app import database, schemas, models
from app.auth import verify_token

router = APIRouter(tags=["stats"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user_id(request: Request) -> str:
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return payload.get("sub")

@router.post("/events", response_model=schemas.ListeningEventResponse)
def add_listening_event(
    event: schemas.ListeningEventCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    
    listening_event = models.ListeningEvent(
        id=str(uuid.uuid4()),
        user_id=user_id,
        episode_id=event.episode_id,
        podcast_id=event.podcast_id,
        event_type=event.event_type,
        position_seconds=event.position_seconds,
        playback_rate=event.playback_rate,
        session_id=event.session_id,
        timestamp=datetime.utcnow()
    )
    db.add(listening_event)
    db.commit()
    db.refresh(listening_event)
    
    return listening_event

@router.get("/events", response_model=List[schemas.ListeningEventResponse])
def get_listening_events(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    events = db.query(models.ListeningEvent).filter(
        models.ListeningEvent.user_id == user_id
    ).order_by(models.ListeningEvent.timestamp.desc()).limit(1000).all()
    return events

@router.put("/position/{episode_id}", response_model=schemas.PlaybackPositionResponse)
def update_playback_position(
    episode_id: str,
    position: schemas.PlaybackPositionUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    
    existing = db.query(models.PlaybackPosition).filter(
        models.PlaybackPosition.user_id == user_id,
        models.PlaybackPosition.episode_id == episode_id
    ).first()
    
    if existing:
        existing.position_seconds = position.position_seconds
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    
    new_position = models.PlaybackPosition(
        id=str(uuid.uuid4()),
        user_id=user_id,
        episode_id=episode_id,
        position_seconds=position.position_seconds,
        updated_at=datetime.utcnow()
    )
    db.add(new_position)
    db.commit()
    db.refresh(new_position)
    return new_position

@router.get("/position/{episode_id}", response_model=schemas.PlaybackPositionResponse)
def get_playback_position(
    episode_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    
    position = db.query(models.PlaybackPosition).filter(
        models.PlaybackPosition.user_id == user_id,
        models.PlaybackPosition.episode_id == episode_id
    ).first()
    
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No playback position found"
        )
    
    return position

@router.get("/sync", response_model=dict)
def get_all_data(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    
    podcasts = db.query(models.Podcast).filter(models.Podcast.user_id == user_id).all()
    events = db.query(models.ListeningEvent).filter(
        models.ListeningEvent.user_id == user_id
    ).all()
    positions = db.query(models.PlaybackPosition).filter(
        models.PlaybackPosition.user_id == user_id
    ).all()
    
    return {
        "podcasts": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "feed_url": p.feed_url,
                "image_url": p.image_url,
                "author": p.author,
                "episodes": [{"id": e.id, "title": e.title, "audio_url": e.audio_url} for e in p.episodes]
            }
            for p in podcasts
        ],
        "events": [
            {
                "episode_id": e.episode_id,
                "podcast_id": e.podcast_id,
                "event_type": e.event_type,
                "position_seconds": e.position_seconds,
                "timestamp": e.timestamp.isoformat()
            }
            for e in events
        ],
        "positions": [
            {"episode_id": p.episode_id, "position_seconds": p.position_seconds}
            for p in positions
        ]
    }

@router.post("/sync")
def sync_data(
    data: dict,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    
    if "podcasts" in data:
        for podcast_data in data["podcasts"]:
            existing = db.query(models.Podcast).filter(
                models.Podcast.user_id == user_id,
                models.Podcast.feed_url == podcast_data.get("feed_url")
            ).first()
            
            if not existing:
                podcast = models.Podcast(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    title=podcast_data.get("title", "Unknown"),
                    description=podcast_data.get("description"),
                    feed_url=podcast_data.get("feed_url", ""),
                    image_url=podcast_data.get("image_url"),
                    author=podcast_data.get("author")
                )
                db.add(podcast)
                db.commit()
    
    if "events" in data:
        for event_data in data["events"]:
            event = models.ListeningEvent(
                id=str(uuid.uuid4()),
                user_id=user_id,
                episode_id=event_data.get("episode_id", ""),
                podcast_id=event_data.get("podcast_id", ""),
                event_type=event_data.get("event_type", "progress"),
                position_seconds=event_data.get("position_seconds", 0),
                session_id=event_data.get("session_id", ""),
                timestamp=datetime.utcnow()
            )
            db.add(event)
    
    if "positions" in data:
        for pos_data in data["positions"]:
            existing = db.query(models.PlaybackPosition).filter(
                models.PlaybackPosition.user_id == user_id,
                models.PlaybackPosition.episode_id == pos_data.get("episode_id")
            ).first()
            
            if existing:
                existing.position_seconds = pos_data.get("position_seconds", 0)
                existing.updated_at = datetime.utcnow()
            else:
                new_pos = models.PlaybackPosition(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    episode_id=pos_data.get("episode_id", ""),
                    position_seconds=pos_data.get("position_seconds", 0),
                    updated_at=datetime.utcnow()
                )
                db.add(new_pos)
    
    db.commit()
    return {"message": "Data synced successfully"}