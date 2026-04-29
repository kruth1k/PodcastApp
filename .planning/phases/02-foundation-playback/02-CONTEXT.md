# Phase 2: Foundation & Playback - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can play podcast episodes with full audio controls: play/pause, seek, skip forward/back, and adjust playback speed.

This is Phase 2 — playback builds on the subscription/library foundation from Phase 1. Users subscribe to podcasts first (Phase 1), then play from their library (Phase 2).

</domain>

<decisions>
## Implementation Decisions

### Audio Playback
- **D-12:** Use howler.js (2.3.x) for web audio playback
  - Rationale: Industry standard, Web Audio API with HTML5 fallback, streaming support, rate control
  - Source: research/STACK.md, research/ARCHITECTURE.md

### Player UI Structure
- **D-13:** Bottom bar player component (Spotify-style persistent player)
  - Layout: Fixed bottom bar across all pages, expands to full player on tap
  - Components: PlaybackControls (play/pause, skip), ProgressBar (seek), EpisodeInfo (title, podcast)
  - Placement: In layout.tsx as persistent element, wraps page content
- **D-14:** Episode detail page gets "Play" button that loads episode into player store
- **D-15:** Player controls: play/pause, previous (seek -30), next (seek +15), progress bar for seeking

### State Management
- **D-16:** Separate playerStore in Zustand (not in podcastStore)
  - State: currentEpisode, isPlaying, position, duration, playbackRate, volume
  - Pattern: Player state persists across navigation (layout-level component)
- **D-17:** PlayerStore subscribes to howler.js events for position updates
- **D-18:** Speed control (D-09) and skip intervals (D-08) stored in playerStore

### Speed Control UI
- **D-19:** Speed selector as dropdown or button group in player bar
- **D-20:** Speed presets: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x, 2.5x, 3x
- **D-21:** Visual feedback: Show current speed (e.g., "1.5x") on player bar

### Skip Buttons UI
- **D-22:** Skip backward: 30 seconds default (configurable in future)
- **D-23:** Skip forward: 15 seconds default (configurable in future)
- **D-24:** Skip buttons visible in player bar and expanded player view

### Requirements for This Phase
- PLAY-01: User can play an episode with play/pause control
- PLAY-02: User can seek to specific position in episode
- PLAY-03: User can skip forward (15s/30s configurable) — default 15s
- PLAY-04: User can skip backward (15s/30s configurable) — default 30s
- PLAY-05: User can adjust playback speed (0.5x to 3x)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- .planning/PROJECT.md — Core value: Statistics-first podcast app
- .planning/REQUIREMENTS.md — v1 requirements with REQ-IDs
- .planning/ROADMAP.md — Phase structure and success criteria

### Prior Context
- .planning/phases/01-podcast-subscription/01-CONTEXT.md — Stack decisions from Phase 1

### Stack Decisions (from Phase 1)
- Backend: Python FastAPI + PostgreSQL
- Web: Next.js 15 + howler.js + Zustand + Recharts
- Mobile: React Native (Expo) — not in scope for Phase 2

### Research
- .planning/research/STACK.md — Full tech stack recommendations
- .planning/research/ARCHITECTURE.md — Clean Architecture with MVVM, event capture from playback layer

</canonical_refs>

<code_context>
## Existing Code Insights

### Phase 1 Code (Reusable)
Backend:
- /api/episodes endpoint already exists (GET by podcast_id)
- Episode model has audio_url field
- Frontend: api.ts has getEpisodes()

Frontend:
- podcastStore.ts pattern for Zustand stores
- EpisodeCard.tsx, EpisodeList.tsx for displaying episodes
- api.ts client pattern

### Phase 2 New Components

Backend (optional for Phase 2):
- May need playback position endpoint for persistence (Phase 3)

Frontend:
- stores/playerStore.ts (NEW)
- components/PlayerBar.tsx (NEW) — bottom bar player
- components/PlayerExpanded.tsx (NEW) — full player view
- components/SpeedSelector.tsx (NEW)
- components/SkipButton.tsx (NEW)
- app/layout.tsx (MODIFY) — add persistent player
- app/podcast/[id]/page.tsx (MODIFY) — add play button

### Integration Points
- EpisodeCard: Add play button → playerStore.playEpisode(episode)
- Layout: Wrap children in player provider, add PlayerBar
- API: episodes already have audio_url — ready for playback

</code_context>

<specifics>
## Specific Ideas

### Player Store Structure
```typescript
interface PlayerStore {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  position: number;      // seconds
  duration: number;     // seconds
  playbackRate: number; // 1.0, 1.5, etc.
  
  // Actions
  playEpisode: (episode: Episode) => void;
  togglePlay: () => void;
  seek: (position: number) => void;
  setPlaybackRate: (rate: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
}
```

### Bottom Bar Player Layout
```
┌─────────────────────────────────────────────────────┐
│                    Page Content                      │
├─────────────────────────────────────────────────────┤
│ [Episode Title          ] [<<] [▶/❚❚] [>>] [⚙️]   │
│ [Podcast Name           ] [━━━━━━━━━●━━━━━]  12:34  │
└─────────────────────────────────────────────────────┘
```

### Speed Selector Options
- 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x, 2.5x, 3x
- Show as pill buttons or dropdown
- Default: 1x

</specifics>

<deferred>
## Deferred Ideas

### For Future Phases
- PLAY-06: Episode playback position persists across sessions (Phase 3)
- PLAY-07: Audio continues playing in background when app is minimized (Phase 4)
- Background playback requires service worker or separate mechanism
- Event capture service (Phase 4) — captures play/pause/seek events for statistics

### Out of Scope (per PROJECT.md)
- Advanced audio processing
- Cross-device sync
- Download management (Phase 3+)

</deferred>

---

*Phase: 02-foundation-playback*
*Context gathered: 2026-04-30*