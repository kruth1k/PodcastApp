from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from datetime import datetime, timedelta
import uuid
from app import database, schemas, models
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    REFRESH_TOKEN_EXPIRE_DAYS
)

router = APIRouter(tags=["auth"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.Token)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = models.User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token()
    
    refresh_token_obj = models.RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return schemas.Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token_obj = db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == user.id
    ).first()
    
    if refresh_token_obj:
        db.delete(refresh_token_obj)
    
    new_refresh_token = create_refresh_token()
    refresh_token_obj = models.RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=new_refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return schemas.Token(access_token=access_token, refresh_token=new_refresh_token)

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(token_data: schemas.TokenRefresh, db: Session = Depends(get_db)):
    stored_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == token_data.refresh_token
    ).first()
    
    if not stored_token or stored_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user = db.query(models.User).filter(models.User.id == stored_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    db.delete(stored_token)
    new_refresh_token = create_refresh_token()
    new_token_obj = models.RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=new_refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(new_token_obj)
    db.commit()
    
    return schemas.Token(access_token=access_token, refresh_token=new_refresh_token)

@router.post("/logout")
def logout(token_data: schemas.TokenRefresh, db: Session = Depends(get_db)):
    stored_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == token_data.refresh_token
    ).first()
    
    if stored_token:
        db.delete(stored_token)
        db.commit()
    
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user(request: Request, db: Session = Depends(get_db)):
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
    
    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user