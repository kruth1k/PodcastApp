from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import podcasts, episodes
from app.routers import auth, stats
import os

app = FastAPI(title="PodcastStats API", version="1.0.0")

# Allow all origins - wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://podcast-app-gules-eta.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(podcasts.router, prefix="/api/podcasts", tags=["podcasts"])
app.include_router(episodes.router, prefix="/api/episodes", tags=["episodes"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])

@app.get("/")
def root():
    return {"message": "PodcastStats API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/debug-cors")
def debug():
    return {"message": "cors test"}