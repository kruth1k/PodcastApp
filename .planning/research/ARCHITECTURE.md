# Architecture Patterns: Podcast Player with Statistics

**Project:** PodcastStats
**Researched:** 2026-04-29
**Confidence:** MEDIUM

## Executive Summary

Podcast player systems with statistics tracking follow a modular architecture built on **offline-first principles** with MVVM + Repository patterns. The critical insight for a statistics-focused app is that **analytics data must be captured at the playback layer first** — before any aggregation or UI consumption. The core components break down into five distinct layers: the audio playback engine, the event capture system, the data persistence layer, the aggregation/analytics engine, and the presentation layer. Statistics as a primary feature requires designing the data model and event capture from day one, not retrofitting it later.

## Recommended Architecture

The recommended architecture follows **Clean Architecture** with clear separation between presentation, domain, and data layers. For a statistics-first podcast player, the architecture must capture granular playback events at the source and persist them for later aggregation — this is the foundational design decision that determines whether statistics are accurate and comprehensive.

### Layer Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │    Home      │ │   Player     │ │  Statistics  │               │
│  │   Screen     │ │   Screen     │ │   Screen     │               │
│  └──────────────┘ └──────────────┘ └──────────────┘               │
│         │                │                │                         │
│         ▼                ▼                ▼                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │ LibraryVM    │ │  PlayerVM    │ │   StatsVM    │               │
│  └──────────────┘ └──────────────┘ └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │  Use Cases   │ │  Use Cases   │ │  Use Cases   │               │
│  │ (library)    │ │ (playback)   │ │ (statistics)│               │
│  └──────────────┘ └──────────────┘ └──────────────┘               │
│         │                │                │                         │
│         ▼                ▼                ▼                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │ Repository  │ │ Repository   │ │ Repository   │               │
│  │ Interface   │ │ Interface    │ │ Interface    │               │
│  └──────────────┘ └──────────────┘ └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 EVENT CAPTURE SERVICE                        │   │
│  │    (captures playback events: play, pause, seek, complete)  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │   Local Database   │  │   Remote API        │                  │
│  │     (Room/SQLite)  │  │  (RSS Feeds, iTunes) │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PLAYBACK ENGINE LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │            MediaPlayer Service / ExoPlayer                   │   │
│  │  (handles audio decoding, streaming, background playback)    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Boundaries

Each component has a clearly defined responsibility and communicates through defined interfaces. For a statistics-first app, the critical connections are between the playback engine and the event capture service — this is where all statistics originate.

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **MediaPlayerService** | Audio decoding, streaming, background playback, media session controls | EventCaptureService, PlayerViewModel |
| **EventCaptureService** | Captures all playback events (play, pause, seek, complete, skip) with timestamps and position data | MediaPlayerService, StatisticsRepository |
| **PodcastRepository** | Fetches, parses, and caches podcast/episode data from RSS feeds and remote APIs | RemoteDataSource, LibraryViewModel |
| **StatisticsRepository** | Persists listening events, calculates aggregations | LocalDatabase, StatsViewModel |
| **DownloadService** | Manages episode downloads for offline playback | LocalStorage, PodcastRepository |

### Critical Communication Paths

The most important communication path for statistics is:

```
MediaPlayerService → [playback events via callback] → EventCaptureService → [store events] → StatisticsRepository → [query aggregations] → StatsViewModel → StatisticsScreen
```

This path must be **synchronous and reliable** — events cannot be lost. The EventCaptureService should receive callbacks directly from the MediaPlayerService for every state change:

- `onPlay()` — episode started, timestamp, episode_id
- `onPause()` — playback paused, position captured
- `onSeek()` — seek completed, old_position → new_position
- `onComplete()` — episode finished, total_duration
- `onProgress()` — position update (every N seconds for progress tracking)

## Data Flow

### Primary Data Flows

**Flow 1: Podcast Discovery and Subscription**
```
User Search → SearchScreen → LibraryViewModel → PodcastRepository → 
RemoteAPI (iTunes/RSS) → Parse Response → [podcast, episodes] → 
LocalDatabase (cache) → UI Update
```

**Flow 2: Episode Playback**
```
User Select Episode → PlayerScreen → PlayerViewModel → 
MediaPlayerService → Load Audio → 
RemoteAPI/LocalStorage → Stream Audio → Progress Events → 
EventCaptureService → [capture with episode_id, timestamp, position] → 
StatisticsRepository → [persist to ListeningEvent table]
```

**Flow 3: Statistics Viewing**
```
User Navigate to Stats → StatisticsScreen → StatsViewModel → 
StatisticsRepository → [query listening_events table] → 
Aggregate (by episode/podcast/time_period) → 
Stats Aggregations → UI Display
```

### Event Data Model

The listening event is the atomic unit of statistics. Each playback interaction generates an event:

```typescript
interface ListeningEvent {
  id: string;
  episode_id: string;
  podcast_id: string;
  event_type: 'play' | 'pause' | 'seek_forward' | 'seek_back' | 'complete' | 'progress';
  timestamp: number;          // Unix timestamp
  position_seconds: number;    // Current position when event occurred
  previous_position?: number; // For seek events
  duration_seconds: number;   // Episode total duration
  completed: boolean;          // True if episode completed (>90% watched)
}
```

This event structure enables all statistics queries: time-based aggregation, completion rates, most-listened content, and retention curves.

## Build Order and Dependencies

For a greenfield project with statistics as the core value, the recommended build order reflects the dependency chain between components:

### Phase 1: Foundation

**Build first: MediaPlayerService and LocalDatabase**

The playback engine and data persistence are the prerequisites for everything else. Without these, no events can be captured or stored.

```
1.1 MediaPlayerService (ExoPlayer/Media3)
    - Audio streaming and playback
    - Background playback support
    - Media session integration
    - Position tracking callback

1.2 LocalDatabase (Room)
    - Episode table
    - Podcast table
    - ListeningEvent table (design for statistics from the start)
```

**Why first:** Statistics require a place to store events and a way to play audio. Building the database schema for statistics first (not retrofitted later) is critical. The ListeningEvent table design determines what statistics are possible.

### Phase 2: Event Capture

**Build second: EventCaptureService and basic playback UI**

Connecting the playback engine to event capture, and exposing basic player controls.

```
2.1 EventCaptureService
    - Callback handlers from MediaPlayerService
    - Event persistence to ListeningEvent table
    - Position tracking (periodic progress events)

2.2 PlayerScreen and PlayerViewModel
    - Play/pause/seek controls
    - Progress display
    - Episode metadata display
```

**Why second:** The entire statistics system depends on capturing events. EventCaptureService must be integrated with MediaPlayerService from the beginning — it cannot be added later without potentially losing historical data.

### Phase 3: Library Management

**Build third: Podcast discovery and library**

Adding the ability to subscribe to podcasts and manage a library.

```
3.1 PodcastRepository
    - RSS feed parsing
    - Remote API integration (iTunes/Podcast Index)
    - Local cache management

3.2 LibraryScreen
    - Podcast list display
    - Subscription management
    - Episode list per podcast
```

**Why third:** Users need content to play before statistics are meaningful. The library provides the podcasts and episodes that will generate listening events.

### Phase 4: Statistics Engine

**Build fourth: StatisticsRepository and aggregation logic**

Building the analytics layer on top of the captured events.

```
4.1 StatisticsRepository
    - Time aggregation queries (daily, weekly, monthly, yearly)
    - Top podcasts/episodes queries
    - Completion rate calculations
    
4.2 StatisticsScreen
    - Time-based stats display
    - Top content lists
    - Filter by time period
```

**Why fourth:** Statistics require events to aggregate. By phase 4, the event capture system has been running and generating data. The StatisticsRepository can now query that data to produce meaningful analytics.

### Dependency Graph

```
MediaPlayerService ──► EventCaptureService ──► StatisticsRepository
        │                      │
        │                      ▼
        │               ListeningEvent (table)
        │                      │
        ▼                      ▼
PlayerViewModel ─────► PlayerScreen
                             
PodcastRepository ──► LibraryViewModel ──► LibraryScreen
        │
        ▼
   Episode (table), Podcast (table)
```

## Scalability Considerations

For a personal podcast player (not server-side analytics), the architecture scales differently than commercial podcast platforms. Key considerations:

| Concern | At 100 Episodes | At 1,000 Episodes | At 10,000 Episodes |
|---------|-----------------|------------------|-------------------|
| **Event Storage** | Simple SQLite | Room indexing required | Partitioned by time |
| **Query Performance** | Direct queries | Materialized views for aggregations | Pre-aggregated tables |
| **Memory** | Load all events | Paginated queries | Background aggregation job |

### Database Scaling Strategy

For personal use, a single ListeningEvent table works well up to thousands of episodes. The key optimization is **pre-aggregating daily stats**:

```sql
-- Instead of counting raw events every query:
SELECT SUM(duration_seconds) FROM ListeningEvent WHERE podcast_id = ?

-- Pre-computed daily stats (refreshed on app open):
CREATE TABLE DailyStats (
  date TEXT,           -- YYYY-MM-DD
  podcast_id TEXT,
  episode_id TEXT,
  total_seconds INTEGER,
  listen_count INTEGER,
  completion_count INTEGER
);
```

This prevents slow queries as the event table grows. The aggregation runs incrementally (only new events since last calculation) rather than recalculating everything.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Statistics as Afterthought

**What happens:** Build the podcast player, then add statistics by querying playback history. The result: incomplete data (no seek events tracked), inaccurate totals (only start/end stored), no completion tracking.

**Prevention:** Design the ListeningEvent table schema before writing any playback code. Every player state change should generate an event with all relevant context (position, timestamp, episode ID).

### Anti-Pattern 2: Storing Only Summary Data

**What happens:** Store only "minutes played" aggregate, not raw events. The result: cannot show time-based trends, cannot calculate completion rates, cannot analyze listening patterns.

**Prevention:** Store every raw event. Aggregations are derived from events, not the other way around. Raw events support any future analysis; summaries do not.

### Anti-Pattern 3: Tight Coupling Between Playback and UI

**What happens:** Player logic directly tied to PlayerScreen. Statistics capture only happens when screen is visible. Background playback produces no statistics.

**Prevention:** EventCaptureService receives callbacks from MediaPlayerService at the service level — entirely decoupled from UI. Statistics capture works during background playback, screen-off playback, and when the app is minimized.

## Technology Recommendations

Given the cross-platform requirement (web and mobile consideration), the architecture should be designed with platform abstraction in mind. However, the following technologies are recommended for the primary implementation:

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Playback Engine** | Media3 (Android) / AVFoundation (iOS) / Howler.js (Web) | Industry standard, background playback support |
| **Local Database** | SQLite / Room | Reliable local persistence, efficient queries |
| **State Management** | MVVM with StateFlow | Reactive UI updates, lifecycle-aware |
| **Dependency Injection** | Koin (Android) / Hilt | Simplified testing, modular components |
| **Remote Data** | RSS Parser + iTunes API | Standard podcast discovery and feeds |

## Sources

- **Architecture patterns**: Pocket FM's offline-first MVVM architecture [FastPix blog](https://fastpix.io/blog/system-design-and-site-architecture-for-an-audio-streaming-app-like-spotify), [Pocket FM engineering](https://xtra.pocketfm.com/out-of-pocket/engineering-resilience-at-scale-the-offline-first-feed-architecture-of)
- **Player implementation**: Android Media3 service for podcast playback [Reintech media](https://reintech.io/blog/building-android-podcast-app-media-playback-controls), React Native Track Player [Codingstoic](https://www.codingstoic.com/2024/09/05/android-building-a-podcast-app-series-1-mini-in-app-player/)
- **Clean architecture**: Echo Music MVVM + Repository pattern [GitHub Echo-Music](https://github.com/EchoMusicApp/Echo-Music/blob/main/ARCHITECTURE.md), AntennaPod modular structure [AntennaPod blog](https://antennapod.org/blog/2024/05/modernizing-the-code-structure)
- **Statistics tracking**: IAB-compliant podcast analytics metrics [PodcastStats.com](https://www.podcaststats.com/), retention and completion tracking [PodAnalyst](https://podkeyscore.com/)
- **Data model**: OP3 open podcast analytics event structure [WordPress plugin](https://wordpress.org/plugins/podcast-analytics-for-op3/)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Component boundaries | HIGH | Based on established MVVM + Repository patterns from multiple production apps |
| Data flow | HIGH | Standard reactive architecture with proven patterns |
| Build order | MEDIUM | Recommended specifically for statistics-first apps — validated by analyzing where other apps struggle |
| Scalability | MEDIUM | Personal use case has different constraints than commercial platforms |
| Technology choices | MEDIUM | Cross-platform requirement affects choices; web adds complexity |

## Research Gaps

- **Cross-platform web architecture**: The research focused primarily on mobile (Android) patterns. Web podcast players have different constraints (no background playback, different storage APIs). Further research needed for the web component architecture.
- **Pre-aggregation strategy**: The recommended daily stats pre-computation needs validation against actual query patterns. May need phase-specific research once MVP is built.
- **Privacy-first analytics**: Some users prefer local-only statistics. The current architecture supports this, but the UI for "local only" mode needs further consideration.