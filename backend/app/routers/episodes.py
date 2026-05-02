from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import database, crud, schemas

router = APIRouter()

@router.get("", response_model=List[schemas.EpisodeResponse])
def get_episodes(
    podcast_id: str = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(database.get_db)
):
    if not podcast_id:
        raise HTTPException(status_code=400, detail="podcast_id is required")
    
    podcast = crud.get_podcast(db, podcast_id)
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    episodes = crud.get_episodes(db, podcast_id, offset=offset, limit=limit)
    return episodes

@router.get("/count")
def get_episodes_count(podcast_id: str = None, db: Session = Depends(database.get_db)):
    if not podcast_id:
        raise HTTPException(status_code=400, detail="podcast_id is required")
    
    count = crud.get_episodes_count(db, podcast_id)
    return {"count": count}