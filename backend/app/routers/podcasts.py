from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import database, crud, schemas, models
from app.services.rss_parser import parse_feed

router = APIRouter()

@router.get("", response_model=List[schemas.PodcastListResponse])
def get_podcasts(db: Session = Depends(database.get_db)):
    podcasts = crud.get_podcasts(db)
    result = []
    for podcast in podcasts:
        result.append(schemas.PodcastListResponse(
            id=podcast.id,
            title=podcast.title,
            description=podcast.description,
            feed_url=podcast.feed_url,
            image_url=podcast.image_url,
            author=podcast.author,
            episode_count=len(podcast.episodes)
        ))
    return result

@router.post("", response_model=schemas.PodcastResponse, status_code=status.HTTP_201_CREATED)
def add_podcast(podcast_data: schemas.PodcastCreate, db: Session = Depends(database.get_db)):
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
        "author": feed_data.get("author")
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