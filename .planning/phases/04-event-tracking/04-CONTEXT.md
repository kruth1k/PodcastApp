# Phase 4: Event Tracking & Background - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can control playback when the app is minimized and the system accurately tracks listening time for each episode session. This phase is critical because it establishes the event capture infrastructure that powers all future statistics.

This is Phase 4 — builds on Phase 3 (position persistence, feed refresh) to add background playback controls and granular event tracking.

</domain>

<decisions>
## Implementation Decisions

### Background Playback (PLAY-07)

- **D-33:** Web: Use Page Visibility API + Media Session API
  - Detect when page becomes hidden (minimized/switched tabs)
  - Show media notification with playback controls using Media Session API
  - Audio continues playing using howler.js with html5: true streaming
  - Note: Browser limits mean playback may pause after ~30 seconds on some browsers when tab is hidden — acceptable limitation for v1

- **D-34:** Notification-style mini player for background
  - When tab becomes hidden, display floating notification-style mini player
  - Show: Episode title, podcast name, play/pause button, close button
  - Position: Fixed top-right corner of viewport
  - Dismiss: Clicking close stops playback

- **D-35:** Mobile: Background audio via expo-av configuration
  - Audio mode: AUDIO_MODE with background playback enabled
  - Foreground notification with media controls
  - Note: Not in scope for Phase 4 web-only implementation

### Event Capture Service (STAT-01)

- **D-36:** Event capture integrated into playerStore callbacks
  - Events captured at: onplay, onpause, onend, seek operations, periodic progress
  - Use howler.js event callbacks (onplay, onpause, onend, onseek)
  - Add progress event every 30 seconds during playback

- **D-37:** ListeningEvent data model (localStorage)
  ```typescript
  interface ListeningEvent {
    id: string;           // UUID
    episode_id: string;
    podcast_id: string;
    event_type: 'play' | 'pause' | 'seek_forward' | 'seek_back' | 'complete' | 'progress';
    timestamp: number;           // Unix timestamp (ms)
    position_seconds: number;    // Current position
    previous_position?: number;  // For seek events
    playback_rate: number;       // Speed at time of event
    session_id: string;         // Groups events from same play session
  }
  ```

- **D-38:** Session-based tracking with heartbeat
  - Each play creates a new session_id (UUID)
  - Track session start time
  - Add progress events every 30 seconds to calculate actual listening duration
  - Session ends on: pause > 30 seconds, episode complete, app close
  - Rationale: Prevents inflation from fast-forwarding (Pitfall 1 from PITFALLS.md)

- **D-39:** Statistics storage structure
  ```typescript
  // Store events
  localStorage.setItem('podcast_stats_events', JSON.stringify(ListeningEvent[]));
  
  // Store aggregated daily stats (pre-computed for fast queries)
  localStorage.setItem('podcast_stats_daily', JSON.stringify({
    date: string,           // YYYY-MM-DD
    podcast_id: string,
    total_seconds: number,
    session_count: number,
  }[]));
  ```

- **D-40:** Event deduplication and validation
  - Skip progress events if < 25 seconds since last progress event (handle duplicate callbacks)
  - Validate: Reject events where timestamp is in future or too far in past (> 1 hour)
  - Flag for review: Sessions > 12 hours (likely background left playing)

### Notification Controls (PLAY-07 continued)

- **D-41:** Media Session API integration
  ```typescript
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => playerStore.togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => playerStore.togglePlay());
    navigator.mediaSession.setActionHandler('seekbackward', () => playerStore.skipBackward());
    navigator.mediaSession.setActionHandler('seekforward', () => playerStore.skipForward());
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: podcast.title,
      artwork: podcast.image_url,
    });
  }
  ```

### Requirements for This Phase

- **PLAY-07:** Audio continues playing in background when app is minimized
  - Web: Page Visibility API detects tab switch, Media Session provides notification controls
  - Mini notification player shown when tab hidden
- **STAT-01:** System tracks minutes watched for each episode session
  - ListeningEvent captures every playback interaction
  - Session tracking with 30-second heartbeat for accurate time calculation

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
- .planning/phases/03-feed-management/03-CONTEXT.md — Position persistence

### Stack Decisions (from Phase 1 & 2)
- Backend: Python FastAPI + PostgreSQL
- Web: Next.js 15 + howler.js + Zustand
- Statistics storage: localStorage (can migrate to API later per D-29)

### Research
- .planning/research/ARCHITECTURE.md — EventCaptureService + ListeningEvent data model
- .planning/research/PITFALLS.md — Pitfall 1 (incorrect time tracking), Pitfall 4 (background killed)

</canonical_refs>

<existing_code>
## Existing Code Insights

### Phase 2-3 Code (Reusable)
Frontend:
- stores/playerStore.ts — Howler.js integration, position tracking
- stores/podcastStore.ts — Podcast/episodes state
- lib/api.ts — API client pattern
- components/PlayerBar.tsx — Bottom bar player UI

### Phase 4 New Components

Frontend:
- hooks/useVisibilityChange.ts (NEW) — Page Visibility API hook
- hooks/useMediaSession.ts (NEW) — Media Session API integration
- components/BackgroundMiniPlayer.tsx (NEW) — Notification-style player when backgrounded
- stores/statsStore.ts (NEW) — Listening events storage and aggregation
- stores/playerStore.ts (MODIFY) — Add event capture callbacks
- app/layout.tsx (MODIFY) — Add visibility listener provider

### Integration Points
- playerStore.onplay → capture 'play' event + create session
- playerStore.onpause → capture 'pause' event
- playerStore.seek → capture 'seek_forward' or 'seek_back' event
- playerStore.updatePosition → periodic progress events every 30s
- Page visibility change → show/hide BackgroundMiniPlayer

</existing_code>

<specifics>
## Specific Ideas

### Visibility Detection Hook
```typescript
// hooks/useVisibilityChange.ts
export function useVisibilityChange(onVisibilityChange: (hidden: boolean) => void) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      onVisibilityChange(document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onVisibilityChange]);
}
```

### Media Session Setup
```typescript
// hooks/useMediaSession.ts
export function useMediaSession(episode: Episode, podcast: Podcast, isPlaying: boolean) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    
    const metadata = {
      title: episode.title,
      artist: podcast.title,
      artwork: podcast.image_url ? [{ src: podcast.image_url, sizes: '512x512', type: 'image/png' }] : [],
    };
    
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
    
    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('seekbackward', () => skipBackward());
    navigator.mediaSession.setActionHandler('seekforward', () => skipForward());
  }, [episode, podcast, isPlaying]);
}
```

### Background Mini Player Layout
```
┌──────────────────────────────────────────────────────────┐
│ [Album Art] Episode Title                                │
│           Podcast Name                                   │
│           [<<] [▶/❚❚] [>>]                        [X]   │
└──────────────────────────────────────────────────────────┘
Position: Fixed top-right, z-index: 9999, min-width: 320px
```

### Event Capture in playerStore
```typescript
// Add to onplay callback
onplay: () => {
  const sessionId = generateUUID();
  captureEvent('play', position, null, sessionId);
  startProgressHeartbeat(sessionId);
  set({ isPlaying: true });
  get().updatePosition();
},

// Add periodic progress tracking
const progressInterval = setInterval(() => {
  captureEvent('progress', howl.seek(), null, sessionId);
}, 30000); // Every 30 seconds
```

### Daily Stats Aggregation
```typescript
// After each event, optionally aggregate for fast queries
function aggregateDailyStats(events: ListeningEvent[]): DailyStats[] {
  const byDateAndPodcast = new Map<string, DailyStats>();
  
  for (const event of events) {
    if (event.event_type !== 'progress') continue;
    
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    const key = `${date}_${event.podcast_id}`;
    
    const existing = byDateAndPodcast.get(key) || {
      date,
      podcast_id: event.podcast_id,
      total_seconds: 0,
      session_count: 0,
    };
    
    existing.total_seconds += 30; // Each progress = 30 seconds
    byDateAndPodcast.set(key, existing);
  }
  
  return Array.from(byDateAndPodcast.values());
}
```

</specifics>

<deferred>
## Deferred Ideas

### For Future Phases
- Mobile (React Native) background audio via expo-av foreground service
- Backend API for statistics (cross-device sync)
- Pre-aggregated statistics tables for better query performance at scale
- Export/import statistics data
- Listening streak tracking

### Out of Scope (per PROJECT.md)
- Social sharing of statistics
- Cross-device sync (v2+)
- Advanced analytics beyond time tracking

</deferred>

---

*Phase: 04-event-tracking-background*
*Context gathered: 2026-04-30*