# Phase 2: Foundation & Playback - UAT

**Phase:** 02-foundation-playback
**Date:** 2026-04-30
**Status:** Ready for Testing

## Requirements Under Test

| ID | Requirement | Test Method |
|----|-------------|-------------|
| PLAY-01 | User can play an episode with play/pause control | Click play button on episode → audio plays → click pause |
| PLAY-02 | User can seek to specific position in episode | Drag progress bar → audio seeks |
| PLAY-03 | User can skip forward (15s) | Click skip forward button → audio skips 15s |
| PLAY-04 | User can skip backward (30s) | Click skip backward button → audio rewinds 30s |
| PLAY-05 | User can adjust playback speed (0.5x to 3x) | Click speed selector → choose speed → audio plays at speed |

## Test Setup

```bash
# Start backend
docker-compose up -d

# Start frontend
cd web && npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Test Procedure

1. **Add a podcast** - Use a known RSS feed (e.g., "The Changelog" or similar)
2. **Navigate to podcast episodes** - Click on a podcast to see episodes
3. **Test PLAY-01 (Play/Pause)** - Click play button on an episode, verify audio plays
4. **Test PLAY-01 (Pause)** - Click pause button, verify audio stops
5. **Test PLAY-02 (Seek)** - Drag progress bar to middle, verify audio jumps to position
6. **Test PLAY-03 (Skip Forward)** - Click +15s button, verify audio skips forward
7. **Test PLAY-04 (Skip Backward)** - Click -30s button, verify audio rewinds
8. **Test PLAY-05 (Speed)** - Click speed selector, pick 1.5x, verify audio speeds up
9. **Verify Bottom Bar** - Navigate between pages, verify player persists

## Integration Notes

After plan execution, additional integration was performed:
- ✅ PlayerBar added to layout.tsx (persistent bottom bar)
- ✅ Play button added to EpisodeCard
- ✅ Type definitions updated for Episode interface

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| Backend API | ✅ Pass | Running at localhost:8000 |
| Frontend Server | ✅ Pass | Running at localhost:3000 |
| Add Podcast (POD-01) | ✅ Pass | Successfully added "The Changelog" with 51 episodes |
| TypeScript Build | ✅ Pass | All components compile without errors |
| PlayerBar Integration | ✅ Pass | Added to layout.tsx as persistent bottom bar |
| Play Button | ✅ Pass | Added to EpisodeCard component |
| PLAY-01 (Play/Pause) | ✅ Pass | Audio plays and pauses correctly |
| PLAY-02 (Seek) | ✅ Pass | Progress bar seeks smoothly (fixed fast seeking bug) |
| PLAY-03 (Skip Forward) | ✅ Pass | +15s skip works |
| PLAY-04 (Skip Backward) | ✅ Pass | -30s skip works |
| PLAY-05 (Speed) | ✅ Pass | Speed selector 0.5x-3x works |
| Bottom Bar Persistence | ✅ Pass | Player persists across navigation |
| Hydration Error | ⚠️ Known | Next.js SSR hydration mismatch - ignored for now |

---

*UAT created: 2026-04-30*
*Run tests with the app running at localhost:3000*