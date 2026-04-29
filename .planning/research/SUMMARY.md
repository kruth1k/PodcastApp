# Project Research Summary

**Project:** Podcast Player App with Statistics Tracking
**Domain:** Podcast Player / Personal Analytics Application
**Researched:** 2026-04-29
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a podcast player application where **statistics tracking is the core differentiator**, not just an add-on feature. Unlike Apple Podcasts or Spotify which provide implicit, limited analytics, this app makes explicit listening time tracking, completion metrics, and time-grouped statistics primary. Research indicates this is a genuine market gap—existing apps track some data but none provide comprehensive time-based analytics with "minutes saved" metrics.

The recommended approach uses **Next.js 15 with App Router** for persistent audio player layout across routes, **howler.js** for robust cross-browser audio with streaming support, **SQLite via Prisma** for local-first statistics storage, and **Zustand** for lightweight state management. The critical insight from architecture research is that statistics must be captured at the playback layer from day one—the EventCaptureService receives callbacks directly from MediaPlayerService, entirely decoupled from UI. This prevents the common anti-pattern where statistics are retrofitted later and become inaccurate.

Key risks center on **statistics accuracy**: time tracking must handle background playback, app switches, and session boundaries correctly. Database design for time-series statistics is critical—storing only aggregate data per episode causes the "time-period shift" problem where re-playing an episode moves all its duration to the new month. These pitfalls have killed other podcast statistics features.

## Key Findings

### Recommended Stack

**Core technologies:**
- **Next.js 15.x** — Full-stack React framework with persistent player layout. App Router keeps audio player mounted across route changes—player never unmounts during navigation. Industry standard (used by Podverse, Podfriend).
- **howler.js 2.3.x** — Cross-browser audio library with Web Audio API + HTML5 fallback. Supports streaming, rate control, fade effects. The web standard with 3.3M+ weekly downloads.
- **feedsmith 2.9.x** — RSS parser supporting RSS 2.0, iTunes tags, Podcasting 2.0 namespaces. Built on fast-xml-parser, tree-shakable, handles malformed feeds.
- **Prisma 7.x + SQLite** — Type-safe ORM with embedded database for zero-setup local storage. Perfect for single-user personal statistics application.
- **Zustand 5.x** — Lightweight state management (~1.2KB vs Redux's ~19KB). Hook-based API with fine-grained subscriptions—critical for high-frequency audio player state updates.
- **Recharts 2.x** — React charting standard for statistics visualization. Supports time-series, rankings, and distribution charts.

### Expected Features

**Must have (table stakes):**
- RSS parsing for podcast subscription — ingest feeds to get episodes
- Audio playback engine — play/pause, seek, speed control (0.5x-3x)
- Library management — subscribe, organize, mark as played
- Episode progress tracking — resume where left off
- Download for offline — background downloads, storage management

**Should have (competitive differentiators):**
- Minutes watched/listened tracking — core differentiator, track exact listening time
- Minutes saved tracking — time "saved" by completing episodes vs abandoning
- Most listened podcasts/episodes ranking — top shows by aggregate time
- Time-grouped statistics (week/month/year) — core to stats value proposition
- Listening streak tracking — consecutive days listening
- Completion rate analytics — how often users finish episodes

**Defer (v2+):**
- Cross-device sync — requires backend, complex conflict resolution
- Video podcast support — adds significant complexity
- Category/genre breakdown — requires genre metadata from feeds
- User-created playlists — complexity without stats value

### Architecture Approach

The recommended architecture follows **Clean Architecture** with five distinct layers: presentation (screens + view models), domain (use cases), data (repositories), event capture, and playback engine. The critical design decision is that **analytics data must be captured at the playback layer first**, before any aggregation or UI consumption.

**Major components:**
1. **MediaPlayerService** — Audio decoding, streaming, background playback, position tracking callbacks
2. **EventCaptureService** — Captures all playback events (play, pause, seek, progress, complete) with timestamps, episode_id, and position data. Operates at service level, decoupled from UI
3. **StatisticsRepository** — Persists listening events, calculates aggregations, pre-computes daily stats for query performance
4. **PodcastRepository** — RSS feed parsing, remote API integration, local cache management

**Data model insight:** Store individual playback sessions with start time and duration—not aggregate `played_duration` per episode. This prevents the critical "time-period shift" bug where re-playing an episode moves all its duration to the new month.

### Critical Pitfalls

1. **Incorrect Listening Time Tracking** — Statistics show impossible values (150+ hours/day) when sessions aren't properly closed on app background or when client/server disconnection isn't detected. Prevention: Implement heartbeat (30-60s), validate sessions before storage, force closure on background.

2. **Time-Period Shift (Month-to-Month Inconsistency)** — Re-playing an episode updates `last_played_time`, moving ALL its duration to the new month. Prevention: Store per-session data with timestamps, aggregate at query time, not storage time.

3. **Database Corruption Causing Data Loss** — SQLite corruption causes complete loss of listening history. Prevention: WAL mode, automated backups (keep last 7), integrity checks on startup, transactions for multi-step operations.

4. **Background Playback Killed by OS** — Battery optimization kills audio when app backgrounded. Prevention: Configure foreground service with notification, request battery exemption, handle audio focus changes, test on multiple device types.

5. **Memory Crashes During Feed Refresh** — OOM crashes for users with 100+ subscriptions. Prevention: Incremental refresh (last 30 days), memory-efficient image loading, pagination, WorkManager for background refresh.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation
**Rationale:** Database and playback engine are prerequisites for everything—statistics require a place to store events and a way to generate them. Building the ListeningEvent table schema before any playback code is critical.

**Delivers:** 
- MediaPlayerService (howler.js integration)
- LocalDatabase with ListeningEvent table designed for statistics from day one
- Basic playback UI with persistent player

**Addresses:** RSS parsing, basic playback, episode progress tracking (from FEATURES.md)

**Avoids:** Pitfall 2 (time-period shift)—by designing schema correctly from start; Pitfall 3 (database corruption)—WAL mode, backups

### Phase 2: Event Capture & Library
**Rationale:** Statistics system depends entirely on capturing events at the service level. Cannot add later without potentially losing historical data. Also need library management so users have content to play.

**Delivers:**
- EventCaptureService with all event types (play, pause, seek, progress, complete)
- Library management (subscriptions, episode lists)
- Feed management with RSS parsing

**Uses:** feedsmith for RSS parsing, Zustand for state

**Implements:** MediaPlayerService → EventCaptureService → StatisticsRepository data flow

**Avoids:** Pitfall 1 (incorrect time tracking)—heartbeat and session validation; Pitfall 7 (position lost on resume)—save position immediately on pause

### Phase 3: Statistics Engine
**Rationale:** Now that event capture has been running and generating data, build aggregation layer on top. Essential to have raw events stored before building analytics.

**Delivers:**
- StatisticsRepository with aggregation queries (daily, weekly, monthly, yearly)
- Statistics screen with time-based views
- Top podcasts/episodes rankings
- Minutes saved calculations
- Listening streak tracking

**Implements:** Pre-aggregation for performance (daily stats table)

**Avoids:** Pitfall 1 (incorrect time tracking)—validate all statistics before display; Pitfall 2 (time-period shift)—aggregating from raw sessions

### Phase 4: Polish & Offline
**Rationale:** Core experience working. Add mobile-first features and performance refinements.

**Delivers:**
- Download for offline playback (IndexedDB via idb)
- PWA support with Service Worker
- Battery optimization refinements
- Storage management UI

**Avoids:** Pitfall 4 (background killed)—proper foreground service; Pitfall 10 (battery drain)—audio offload, proper wake locks; Pitfall 11 (storage exhaustion)—auto-cleanup policies

### Phase Ordering Rationale

- **Phase 1→2 dependency:** EventCaptureService requires MediaPlayerService to be running—can't capture what isn't played. Library needs to exist before meaningful statistics can accumulate.
- **Phase 2→3 dependency:** Statistics aggregations require raw events to exist. Building aggregation on empty data wastes effort.
- **Grouping logic:** Each phase produces a working increment—the app is usable after Phase 2 but limited. Statistics become meaningful after Phase 3.
- **Pitfall avoidance:** Every phase maps to specific pitfalls that research identified as critical. Phase 1 prevents schema issues, Phase 2 prevents tracking issues, Phase 3 prevents aggregation bugs.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Statistics Engine):** Pre-aggregation strategy needs validation against actual query patterns once MVP has data. May need phase-specific research.
- **Phase 4 (PWA):** Cross-platform web architecture research focused on mobile patterns. Web has different constraints (no background playback, different storage APIs).

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js + howler.js patterns well-documented
- **Phase 2 (Event Capture):** Clean Architecture + MVVM from established production apps (Podverse, AntennaPod)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based on production apps (Podverse), official documentation, industry consensus |
| Features | HIGH | Market gap analysis from Edison Research, competitor feature comparison |
| Architecture | MEDIUM | Clean Architecture well-established, but cross-platform (web) adds complexity not fully researched |
| Pitfalls | MEDIUM-HIGH | Multiple real-world bug reports from AntennaPod and Audiobookshelf—statistics issues well-documented |

**Overall confidence:** MEDIUM-HIGH

The core pitfalls around statistics tracking and playback reliability are well-supported by real-world bug reports. Stack and features are highly confident based on established industry patterns. Light reduction for cross-platform web architecture complexity and pre-aggregation strategy requiring validation.

### Gaps to Address

- **Cross-platform (web) architecture:** Research focused primarily on mobile (Android) patterns. Web podcast players have different constraints (no background playback, different storage APIs). Further research needed for web component architecture.

- **Pre-aggregation strategy:** The recommended daily stats pre-computation needs validation against actual query patterns. May need phase-specific research once MVP has real usage data.

- **Privacy-first analytics:** Architecture supports local-only statistics, but UI for "local-only" mode needs consideration if user demand emerges.

## Sources

### Primary (HIGH confidence)
- Podverse monorepo (GitHub) — Production Next.js + Prisma stack
- howler.js official documentation — Web audio standard
- AntennaPod issue discussions (GitHub) — Real statistics tracking bugs
- Edison Research Infinite Dial 2026 — Listening habits data

### Secondary (MEDIUM confidence)
- feedsmith RSS parser — Fast feed parsing library
- Clean Architecture patterns — Multiple production app references
- IAB-compliant podcast analytics metrics — Standard measurement approaches

### Tertiary (LOW confidence)
- Pre-aggregation strategy recommendations — Needs validation with real query patterns
- Cross-platform (web) architecture for this specific stack — Limited precedents

---
*Research completed: 2026-04-29*
*Ready for roadmap: yes*