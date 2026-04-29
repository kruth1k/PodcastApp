from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import database, crud, schemas

router = APIRouter()

@router.get("", response_model=List[schemas.EpisodeResponse])
def get_episodes(podcast_id: str = None, db: Session = Depends(database.get_db)):
    if not podcast_id:
        raise HTTPException(status_code=400, detail="podcast_id is required")
    
    podcast = crud.get_podcast(db, podcast_id)
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    episodes = crud.get_episodes(db, podcast_id)
    return episodes