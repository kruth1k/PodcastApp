from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
import uuid
from app import database, crud, schemas, models
from app.services.rss_parser import parse_feed
from app.auth import verify_token

router = APIRouter(tags=["podcasts"])

def get_current_user_id(request: Request, db: Session = Depends(database.get_db)) -> str:
    """Get current user ID from token, or return None for guest mode"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    
    if not payload or payload.get("type") != "access":
        return None
    
    return payload.get("sub")

@router.get("", response_model=List[schemas.PodcastResponse])
def get_podcasts(request: Request, db: Session = Depends(database.get_db)):
    user_id = get_current_user_id(request, db)
    podcasts = crud.get_podcasts_for_user(db, user_id)
    return podcasts

@router.post("", response_model=schemas.PodcastResponse, status_code=status.HTTP_201_CREATED)
def add_podcast(podcast_data: schemas.PodcastCreate, request: Request, db: Session = Depends(database.get_db)):
    user_id = get_current_user_id(request, db)
    
    try:
        feed_data = parse_feed(podcast_data.feed_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse RSS feed: {str(e)}")
    
    existing = db.query(models.Podcast).filter_by(feed_url=podcast_data.feed_url).first()
    if existing:
        raise HTTPException(status_code=400, detail="Podcast already exists")
    
    podcast = crud.create_podcast(db, {
        "title": feed_data["title"],
        "description": feed_data.get("description"),
        "feed_url": podcast_data.feed_url,
        "image_url": feed_data.get("image_url"),
        "author": feed_data.get("author"),
        "user_id": user_id
    })
    
    if feed_data.get("episodes"):
        crud.create_episodes_bulk(db, podcast.id, feed_data["episodes"])
        db.refresh(podcast)
    
    return podcast

@router.get("/{podcast_id}", response_model=schemas.PodcastResponse)
def get_podcast(podcast_id: str, db: Session = Depends(database.get_db)):
    podcast = crud.get_podcast(db, podcast_id)
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    return podcast

@router.delete("/{podcast_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_podcast(podcast_id: str, db: Session = Depends(database.get_db)):
    success = crud.delete_podcast(db, podcast_id)
    if not success:
        raise HTTPException(status_code=404, detail="Podcast not found")
    return None

@router.post("/{podcast_id}/refresh", response_model=schemas.PodcastResponse)
def refresh_podcast(podcast_id: str, db: Session = Depends(database.get_db)):
    podcast = crud.get_podcast(db, podcast_id)
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    try:
        feed_data = parse_feed(podcast.feed_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse RSS feed: {str(e)}")
    
    new_episodes_count = 0
    if feed_data.get("episodes"):
        for episode_data in feed_data["episodes"]:
            existing = db.query(models.Episode).filter(
                models.Episode.podcast_id == podcast_id,
                models.Episode.guid == episode_data["guid"]
            ).first()
            
            if not existing:
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
                new_episodes_count += 1
        
        db.commit()
    
    db.refresh(podcast)
    return podcast

@router.post("/refresh-all")
def refresh_all_podcasts(db: Session = Depends(database.get_db)):
    podcasts = crud.get_podcasts(db)
    results = []
    
    for podcast in podcasts:
        try:
            feed_data = parse_feed(podcast.feed_url)
            new_episodes_count = 0
            
            if feed_data.get("episodes"):
                for episode_data in feed_data["episodes"]:
                    existing = db.query(models.Episode).filter(
                        models.Episode.podcast_id == podcast.id,
                        models.Episode.guid == episode_data["guid"]
                    ).first()
                    
                    if not existing:
                        episode = models.Episode(
                            id=str(uuid.uuid4()),
                            podcast_id=podcast.id,
                            title=episode_data["title"],
                            description=episode_data.get("description"),
                            audio_url=episode_data["audio_url"],
                            duration=episode_data.get("duration"),
                            published_at=episode_data.get("published_at"),
                            guid=episode_data["guid"]
                        )
                        db.add(episode)
                        new_episodes_count += 1
            
            db.commit()
            results.append({"id": podcast.id, "title": podcast.title, "new_episodes": new_episodes_count, "success": True})
        except Exception as e:
            results.append({"id": podcast.id, "title": podcast.title, "new_episodes": 0, "success": False, "error": str(e)})
    
    return results