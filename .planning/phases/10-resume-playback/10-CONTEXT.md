# Phase 10 Context - Resume Playback

## Prior Context
- Phase 9 complete (Loading, Sorting, Dark Mode)
- Frontend: Next.js 15, Zustand, Tailwind
- Backend: FastAPI, PostgreSQL, JWT auth
- playerStore handles audio playback with Howler

## Phase 10 Requirements

### RESUME-01: Show last played episode on login
- When user logs in, check if they have a last-played episode
- Display it in the PlayerBar at bottom

### RESUME-02: First login = no episode
- If no playback position exists, show nothing in player bar

### RESUME-03: Resume from saved position
- Load the saved position (not start from 0)

## Technical Analysis

### Existing Infrastructure
1. **PlaybackPosition model** (backend/app/models.py:68-77):
   - Stores: user_id, episode_id, position_seconds, updated_at

2. **Existing endpoints**:
   - `GET /api/stats/position/{episode_id}` - gets position for one episode
   - `GET /api/stats/sync` - returns all user data including positions

3. **Frontend playerStore**:
   - Has `currentEpisode: Episode | null` state
   - Has `position: number` state
   - Has `loadPosition(episodeId)` function for localStorage

### Gap Identified
No endpoint exists to get the "most recent" playback position across all episodes.

## Implementation Decision (Locked)

### Backend
1. Add new endpoint: `GET /api/stats/last-played`
   - Returns: `{ episode_id, position_seconds, episode: { id, title, audio_url, podcast_id } }` or `null`
   - Query: Get PlaybackPosition with latest `updated_at` for user
   - Also fetch episode details from the associated podcast's episodes

### Frontend
1. In authStore or page.tsx, after successful login:
   - Call `GET /api/stats/last-played`
   - If response has data, set playerStore's `currentEpisode` and `position`
   - Don't auto-play - just show the episode ready to resume

2. Add function to playerStore:
   - `setLastPlayed(episode: Episode, position: number)` - sets both without playing

### Flow
1. User logs in
2. Frontend calls `GET /api/stats/last-played`
3. If data exists → set currentEpisode + position in playerStore
4. PlayerBar shows the episode (but doesn't auto-play)
5. User can click play to resume

## Files to Modify
1. `backend/app/routers/stats.py` - add `/last-played` endpoint
2. `backend/app/schemas.py` - add LastPlayedResponse schema
3. `web/src/lib/api.ts` - add `getLastPlayed()` function
4. `web/src/stores/playerStore.ts` - add `setLastPlayed` action
5. `web/src/app/page.tsx` - call getLastPlayed after login

## Success Criteria Check
- [ ] User logs in and sees last episode in player bar (if any)
- [ ] First login shows empty player bar
- [ ] Position resumes from saved point (not 0)