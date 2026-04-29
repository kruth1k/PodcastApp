# Phase 1: Podcast Subscription & Library - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can subscribe to podcasts via RSS feed URL and browse their library of subscribed shows and episodes.

This is the FIRST phase — podcast subscription comes BEFORE playback (Phase 2). This allows users to add content first, then play from their library.

</domain>

<decisions>
## Implementation Decisions

### Phase Ordering
- **D-01:** Podcast Subscription & Library is Phase 1 (comes before playback)
- **D-02:** Foundation & Playback moves to Phase 2

### Stack Architecture
- **D-03:** Backend: Python with FastAPI + PostgreSQL
- **D-04:** Web Frontend: Next.js 15
- **D-05:** Mobile: React Native (Expo)
- **D-06:** State: Zustand (shared between web and mobile)

### UI Decisions
- **D-07:** Player UI Layout: Bottom bar (Spotify-style, persists across navigation)
- **D-08:** Skip intervals: Configurable with defaults (15s forward, 30s back)
- **D-09:** Playback speed: Full preset range (0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x, 2.5x, 3x)

### Offline Support
- **D-10:** Episode downloads for offline playback
- **D-11:** Offline playback via local storage

### Requirements for This Phase
- POD-01: User can add podcast by RSS feed URL
- POD-02: User can view list of subscribed podcasts
- POD-03: User can unsubscribe from a podcast
- LIB-01: User can view list of episodes for each podcast
- LIB-03: User can view episode details (title, description, duration)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- .planning/PROJECT.md — Core value: Statistics-first podcast app
- .planning/REQUIREMENTS.md — v1 requirements with REQ-IDs
- .planning/ROADMAP.md — Phase structure and success criteria

### Stack Decisions
- Backend: Python FastAPI + PostgreSQL (user decision 2026-04-29)
- Web: Next.js 15 + howler.js + Zustand + Recharts
- Mobile: React Native (Expo) + expo-av

### Architecture
- .planning/research/ARCHITECTURE.md — Clean Architecture with MVVM
- Key: Statistics captured at playback layer from day one

### Research
- .planning/research/STACK.md — Full tech stack recommendations
- .planning/research/PITFALLS.md — Common mistakes to avoid

[If no external specs: No external specs — requirements fully captured in decisions above]

</canonical_refs>

<code_context>
## Existing Code Insights

### Project Status
- Greenfield project — no existing code
- No reusable assets yet

### Architecture for This Phase

**Phase 1 Focus (Subscription/Library):**
`
Backend (FastAPI):
  +-- /api/podcasts (GET, POST, DELETE)
  +-- /api/episodes (GET by podcast)
  +-- RSS parsing service

Frontend:
  +-- PodcastListScreen
  +-- PodcastDetailScreen (episode list)
  +-- EpisodeDetailScreen
`

**Phase 2 Will Add (Playback):**
`
  +-- MediaPlayerService (howler.js / expo-av)
  +-- EventCaptureService
  +-- BottomBarPlayer component
`

</code_context>

<specifics>
## Specific Ideas

No specific references — open to standard approaches following the documented stack patterns.

</specifics>

<deferred>
## Deferred Ideas

### For Future Phases
- Playback controls (Phase 2)
- Event tracking and statistics (Phase 4-6)
- Background playback
- Download management (offline support noted, implementation in Phase 2+)

### Out of Scope (per PROJECT.md)
- Social features
- Podcast discovery/browse
- Cross-device sync
- Video podcasts

</deferred>

---

*Phase: 01-podcast-subscription*
*Context gathered: 2026-04-29*
