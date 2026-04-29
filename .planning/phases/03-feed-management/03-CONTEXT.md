# Phase 3: Feed Management & Progress - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can refresh podcast feeds to get new episodes, persist playback position across sessions, and mark episodes as played/unplayed.

This is Phase 3 — adds feed refresh and progress tracking on top of Phase 1 (subscription) + Phase 2 (playback).

</domain>

<decisions>
## Implementation Decisions

### Feed Refresh (POD-04)
- **D-25:** Per-podcast refresh button
  - Each podcast card has a small refresh icon
  - Click to re-fetch RSS feed and add new episodes
- **D-26:** Bulk refresh option
  - "Refresh All" button in header
  - Updates all subscribed podcasts
- **D-27:** Visual feedback during refresh
  - Show loading spinner on button while fetching
  - Handle errors gracefully (show toast/alert on failure)

### Position Persistence (PLAY-06)
- **D-28:** Store position in localStorage
  - Key: `podcast_position_{episode_id}`
  - Format: `{ position: number, updated_at: timestamp }`
  - Save on: pause, seek, close browser, navigate away
  - Load on: play episode - resume from saved position
- **D-29:** Alternative: Backend API (deferred)
  - Can migrate to backend later for cross-device sync
  - Architecture supports both storage options

### Played/Unplayed Status (LIB-02)
- **D-30:** Auto-mark on completion
  - When playback reaches >90% of episode duration, auto-mark as played
  - Store played status in localStorage: `podcast_played_{episode_id}`
- **D-31:** Visual indicator
  - Played episodes: grayed out text, checkmark icon
  - Unplayed episodes: bold text, dot indicator
- **D-32:** Manual toggle (optional)
  - User can click to manually mark played/unplayed

### Requirements for This Phase
- POD-04: User can refresh podcast feeds to get new episodes
- PLAY-06: Episode playback position persists across sessions
- LIB-02: User can mark episode as played/unplayed

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- .planning/PROJECT.md — Core value: Statistics-first podcast app
- .planning/REQUIREMENTS.md — v1 requirements with REQ-IDs
- .planning/ROADMAP.md — Phase structure and success criteria

### Prior Context
- .planning/phases/01-podcast-subscription/01-CONTEXT.md — Stack decisions
- .planning/phases/02-foundation-playback/02-CONTEXT.md — Player implementation

### Stack Decisions (from Phase 1 & 2)
- Backend: Python FastAPI + PostgreSQL
- Web: Next.js 15 + howler.js + Zustand
- Position storage: localStorage (can migrate to API later)

</canonical_refs>

## Existing Code Insights

### Phase 1-2 Code (Reusable)
Backend:
- /api/podcasts endpoint already exists (GET, POST, DELETE)
- /api/episodes endpoint already exists (GET by podcast_id)
- RSS parsing service: app/services/rss_parser.py

Frontend:
- stores/podcastStore.ts - Zustand store for podcasts
- stores/playerStore.ts - Zustand store for playback
- components/PodcastCard.tsx - podcast display
- components/EpisodeCard.tsx - episode display

### Phase 3 New Components

Backend:
- POST /api/podcasts/{id}/refresh - Refresh single podcast feed
- POST /api/podcasts/refresh - Refresh all podcasts

Frontend:
- stores/playbackStore.ts (MODIFY) - Add position persistence
- components/PodcastCard.tsx (MODIFY) - Add refresh button
- components/EpisodeCard.tsx (MODIFY) - Add played indicator
- components/RefreshButton.tsx (NEW) - Reusable refresh component

### Integration Points
- playerStore: Add loadPosition(), savePosition(), onComplete() handlers
- PodcastCard: Add onRefresh handler -> API call
- EpisodeCard: Show played status based on localStorage

</code_context>

<specifics>
## Specific Ideas

### Position Storage Structure (localStorage)
```typescript
// Save position
localStorage.setItem(`podcast_position_${episodeId}`, JSON.stringify({
  position: 1234, // seconds
  updatedAt: Date.now()
}));

// Load position
const saved = JSON.parse(localStorage.getItem(`podcast_position_${episodeId}`));
if (saved) {
  playerStore.seek(saved.position);
}

// Mark as played
localStorage.setItem(`podcast_played_${episodeId}`, 'true');
```

### Completion Detection
```typescript
// In playerStore, check on each position update:
if (duration > 0 && position / duration > 0.9) {
  localStorage.setItem(`podcast_played_${episodeId}`, 'true');
}
```

### Feed Refresh Flow
1. User clicks refresh button on podcast
2. Button shows spinner
3. Backend re-parses RSS feed
4. Backend adds new episodes (by GUID - avoids duplicates)
5. Frontend fetches updated episode list
6. UI updates with new episodes

</specifics>

<deferred>
## Deferred Ideas

### For Future Phases
- PLAY-07: Background playback when app minimized (Phase 4)
- STAT-01: Event capture service for statistics (Phase 4)
- Cross-device position sync via backend API
- Download episodes for offline (v2)

### Out of Scope (per PROJECT.md)
- Social sharing
- Podcast discovery
- Cross-device sync (v2+)

</deferred>

---

*Phase: 03-feed-management*
*Context gathered: 2026-04-30*