---
phase: "04-event-tracking"
plan: "01"
subsystem: "Playback & Statistics"
tags:
  - "background-playback"
  - "event-tracking"
  - "media-session"
  - "visibility-api"
dependency-graph:
  requires: []
  provides:
    - "statsStore: ListeningEvent capture and session tracking"
    - "BackgroundMiniPlayer: Notification-style mini player when tab hidden"
    - "useVisibilityChange: Page Visibility API hook"
    - "useMediaSession: Media Session API integration"
    - "playerStore with event capture callbacks"
  affects:
    - "web/src/stores/playerStore.ts"
    - "web/src/components/PlayerBar.tsx (for media session)"
tech-stack:
  added: []
  patterns:
    - "Session-based tracking with 30s heartbeat"
    - "Event deduplication (25s minimum interval)"
    - "Page Visibility + Media Session APIs"
    - "localStorage for statistics persistence"
key-files:
  created:
    - "web/src/hooks/useVisibilityChange.ts: Page Visibility API hook"
    - "web/src/hooks/useMediaSession.ts: Media Session API integration"
    - "web/src/components/BackgroundMiniPlayer.tsx: Notification-style mini player"
    - "web/src/stores/statsStore.ts: ListeningEvent capture and aggregation"
  modified:
    - "web/src/stores/playerStore.ts: Added event capture, session tracking, progress heartbeat"
decisions:
  - "D-33: Web uses Page Visibility API + Media Session API"
  - "D-36: Event capture integrated into playerStore callbacks"
  - "D-37: ListeningEvent data model with session_id"
  - "D-38: Session-30s progress heartbeat, pause > 30s ends session"
  - "D-40: Event deduplication (25s min interval)"
metrics:
  duration: "task-execution"
  completed: "2026-04-30"
---

# Phase 4 Plan 1: Event Tracking & Background - Summary

**Background playback and event tracking implementation**

## Completed Tasks

1. **Task 1: Create Page Visibility and Media Session hooks** - `src/hooks/useVisibilityChange.ts`, `src/hooks/useMediaSession.ts`
2. **Task 2: Create BackgroundMiniPlayer component** - `src/components/BackgroundMiniPlayer.tsx`
3. **Task 3: Create statsStore and integrate with playerStore** - `src/stores/statsStore.ts`, modified `src/stores/playerStore.ts`

## What Was Built

### New Hooks
- **useVisibilityChange**: Detects when tab becomes hidden/visible using Page Visibility API
- **useMediaSession**: Integrates with Media Session API for system notification controls (play/pause/seek)

### New Components
- **BackgroundMiniPlayer**: Floating notification-style player that appears when tab is hidden. Shows episode title, podcast name, and playback controls.

### Event Capture Integration
- **playerStore modifications**: Added `captureEvent()`, `startProgressHeartbeat()`, `endSession()` methods
- **Session tracking**: UUID session_id created on play, ends on pause > 30s or episode complete
- **Progress heartbeat**: Captures 'progress' event every 30 seconds during playback
- **Event types**: play, pause, seek_forward, seek_back, complete, progress

### Statistics Storage (statsStore)
- **ListeningEvent interface**: id, episode_id, podcast_id, event_type, timestamp, position_seconds, previous_position, playback_rate, session_id
- **DailyStats interface**: date, podcast_id, total_seconds, session_count
- **localStorage persistence**: 'podcast_stats_events' (max 10,000 events), 'podcast_stats_daily'
- **Event deduplication**: Skips progress events within 25 seconds (D-40)

## Verification Results

| Check | Status |
|-------|-------|
| TypeScript compiles without errors | ✅ |
| useVisibilityChange hook exports | ✅ |
| useMediaSession hook exports | ✅ |
| BackgroundMiniPlayer component renders | ✅ |
| playerStore with event capture | ✅ |
| Event types captured | ✅ |
| Session tracking (D-38) | ✅ |
| Progress heartbeat (30s) | ✅ |
| Event deduplication (25s) | ✅ |
| Events stored in localStorage | ✅ |

## Requirements Addressed

- ✅ **PLAY-07**: Background playback - audio continues when tab minimized, BackgroundMiniPlayer shown
- ✅ **STAT-01**: Track listening events - ListeningEvent captures all interactions, session-based tracking

## Deviations from Plan

None - plan executed exactly as written.

## Files Created/Modified

| File | Type | Lines |
|------|------|------|
| src/hooks/useVisibilityChange.ts | New | ~28 |
| src/hooks/useMediaSession.ts | New | ~52 |
| src/components/BackgroundMiniPlayer.tsx | New | ~102 |
| src/stores/statsStore.ts | New | ~210 |
| src/stores/playerStore.ts | Modified | +80 lines event capture |