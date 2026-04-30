# Phase 7: Library Search - UAT

**Phase:** 07-library-search
**Date:** 2026-04-30
**Status:** Ready for Testing

## Requirements Under Test

| ID | Requirement | Test Method |
|----|-------------|-------------|
| LIB-04 | User can search episodes within library | Type episode title → dropdown shows matching episodes |

## Changes Made This Session

### Backend Fix (Critical)
The search was not finding episodes because the `/api/podcasts` endpoint was not returning episodes. Fixed by:

1. **`backend/app/crud.py`** - Added `joinedload` to eagerly load episodes:
   ```python
   from sqlalchemy.orm import Session, joinedload
   
   def get_podcasts(db: Session) -> List[models.Podcast]:
       return db.query(models.Podcast).options(joinedload(models.Podcast.episodes)).order_by(models.Podcast.created_at.desc()).all()
   ```

2. **`backend/app/routers/podcasts.py`** - Changed response model:
   ```python
   @router.get("", response_model=List[schemas.PodcastResponse])  # Was: PodcastListResponse
   def get_podcasts(db: Session = Depends(database.get_db)):
       podcasts = crud.get_podcasts(db)
       return podcasts
   ```

### Frontend Features (Previously Built)
- **Search bar** with 150ms debounce
- **Live dropdown** with results from:
  - Library podcasts (type: "Library")
  - Library episodes (type: "Episode")  
  - iTunes discovery (type: "Discover")
- **Click-outside** and **Escape key** to close dropdown
- **Episode list** scrollable with `max-h-[500px] overflow-y-auto`

## Test Setup

```bash
# Start backend
cd backend && uvicorn app.main:app --reload --port 8000

# Start frontend
cd web && npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3001 (or 3000)

## Test Procedure

1. **Add a podcast** - Use any RSS feed to add podcasts to library
2. **Verify episodes loaded** - Click on a podcast, verify episodes appear
3. **Test LIB-04 (Episode Search)** - 
   - Type 2+ characters in search bar
   - Dropdown should appear with "Episode" results
   - Click episode → podcast selected, episodes shown
4. **Test Podcast Search** -
   - Type podcast name → "Library" results appear
5. **Test iTunes Discovery** -
   - Search for something not in library → "Discover" results appear
   - Click "Discover" result → podcast added to library
6. **Test Scrollable Episode List** -
   - Select podcast with many episodes
   - Scroll through episode list → should scroll within 500px height
7. **Test Dropdown Close** -
   - Click outside search → dropdown closes
   - Press Escape → dropdown closes

## Code Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backend CRUD | ✅ Pass | `joinedload` imported and used |
| Backend Router | ✅ Pass | Returns `PodcastResponse` with episodes |
| Frontend Search | ✅ Pass | `searchPodcasts` and `searchEpisodes` implemented |
| iTunes API | ✅ Pass | Integrated when no local results |
| Episode List Scroll | ✅ Pass | `max-h-[500px] overflow-y-auto` |
| Search Debounce | ✅ Pass | 150ms delay implemented |

## Files Verified

| File | Exists | Purpose |
|------|--------|---------|
| `web/src/components/SearchResults.tsx` | ✅ | Dropdown with type badges |
| `web/src/stores/podcastStore.ts` | ✅ | searchPodcasts, searchEpisodes methods |
| `web/src/app/page.tsx` | ✅ | Search integration with iTunes |
| `web/src/components/EpisodeList.tsx` | ✅ | Scrollable episode list |
| `backend/app/crud.py` | ✅ | joinedload for episodes |
| `backend/app/routers/podcasts.py` | ✅ | PodcastResponse returned |

## Live Test Results

### Backend API ✅
```
GET /api/podcasts
- Returns podcasts with 50 episodes each
- Episodes include: id, title, description, audio_url, duration, published_at
- Fix verified: joinedload is working correctly
```

### Frontend ❌
- Dev server starts on localhost:3001 but environment blocks HTTP access
- Cannot run browser tests - network restriction in this environment

### Code Verification ✅
- All code changes compile without errors
- API returns correct data structure for search to work

## Known Issues

- Frontend HTTP access blocked in this environment (not a code issue)
- User needs to test from their own machine with browser access

---

*UAT created: 2026-04-30*
*Backend verified working, frontend needs browser access*