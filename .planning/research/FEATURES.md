# Feature Research

**Domain:** Podcast player with statistics tracking focus
**Researched:** 2026-04-29
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Podcast RSS parsing | All podcast apps must ingest RSS feeds to get episodes | MEDIUM | Standard RSS 2.0 with iTunes extensions. Must handle various feed formats and image enclosures |
| Audio playback engine | Core to any podcast app — play/pause, seek, speed control | MEDIUM | Standard HTML5 audio or platform-specific players. Must handle streaming vs downloaded playback |
| Library management | Users expect to subscribe to shows and organize episodes | LOW | Subscribe/unsubscribe, mark as played, episode list per show |
| Download for offline | Mobile-first expectation — listen without internet | MEDIUM | Background downloads, storage management, queue handling |
| Episode progress tracking | Resume where left off is fundamental expectation | LOW | Save playback position per episode, sync across sessions |
| Basic search | Find episodes within subscribed shows | LOW | Search episode titles, show names in local library |
| Playback controls | Standard: play/pause, skip forward/back, speed adjustment | LOW | 15s skip, 30s skip, 0.5x-3x speed (core requirement per Edison Research) |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Minutes watched/listened tracking | Core differentiator — track exact listening time per episode | MEDIUM | Track every play session, accumulate totals, handle gaps gracefully |
| Minutes saved (completion tracking) | Show time "saved" by finishing episodes vs abandoning | MEDIUM | Calculate based on episode length minus incomplete listens |
| Most listened podcasts ranking | Users want to know their top shows | LOW | Aggregate time per show, sort descending, display top N |
| Most listened episodes ranking | Identify favorite specific episodes | LOW | Aggregate time per episode, show episode metadata |
| Time-grouped statistics (week/month/year) | Core to the stats-first value proposition | MEDIUM | Group listening data by period, calculate aggregates, handle date ranges |
| Listening streak tracking | Habit formation insight — consecutive days listening | LOW | Track consecutive days with listening activity, display current streak |
| Average session length analytics | Understand listening patterns | LOW | Calculate mean session length, display trends |
| Total podcasts/episodes consumed | Big number bragging rights | LOW | Count unique shows and episodes listened to |
| Time-of-day listening patterns | When do users listen most | LOW | Aggregate by hour of day, display peak periods |
| Category/genre breakdown | What genres dominate listening time | MEDIUM | Requires genre metadata from feed, or user tagging |
| Completion rate analytics | How often users finish episodes | LOW | Calculate completion % per episode, aggregate by show |
| Estimated yearly listening projections | Extrapolate from current data | LOW | Annualize weekly/monthly trends, show projected totals |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems or violate project constraints.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Podcast discovery/browse | Users want to find new shows | Out of scope per PROJECT.md — focuses on personal stats, not discovery | Keep library-focused; discovery can be external link |
| Social sharing of stats | Users like sharing achievements | Creates privacy complexity, out of scope (PROJECT.md explicitly excludes social) | Focus on personal insight, not sharing |
| Social listening/collaboration | Trendy in some apps | Same as above — violates stats-first personal focus | Not in scope |
| User profiles/community | Seems standard | Not aligned with value — personal stats, not social | Skip entirely |
| Podcast recommendations/algorithms | Spotify, Apple push this | Discovery focus, not in scope | N/A — don't build |
| User-created playlists | Common in players | Complexity without stats value — focus is on listening analytics | Skip for now |
| Comments/reviews | Standard in many apps | Adds community complexity, out of scope | Skip entirely |
| Cross-app importing | Sounds useful | Privacy concerns, technical complexity, not required for v1 | Manual subscribe is fine for v1 |
| Real-time sync across devices | Common expectation | Complexity — handle conflicts, offline scenarios | Defer to v2+ if validated |
| Video podcast support | Growing market (53% interested per Backlinko) | Complexity for stats-first app — requires video handling | Skip for now; audio focus |
| AI transcripts/summaries | Emerging feature (Apple, Spotify) | Not aligned with stats-first value | Skip — not relevant |
| Value4Value payments | Podcasting 2.0 feature | Adds payment complexity, not in scope | Skip |

## Feature Dependencies

```
[RSS Parsing]
    └──requires──> [Library Management]
                       └──requires──> [Episode Progress Tracking]

[Audio Playback]
    └──requires──> [Minutes Watched Tracking]

[Minutes Watched Tracking]
    └──requires──> [Minutes Saved Tracking]
    └──requires──> [Most Listened Podcasts]
    └──requires──> [Most Listened Episodes]
    └──requires──> [Time-Grouped Statistics]

[Time-Grouped Statistics]
    └──enhances──> [Listening Streak Tracking]
    └──enhances──> [Average Session Length]
    └──enhances──> [Yearly Projections]

[Minutes Saved]
    └──requires──> [Completion Rate Analytics]
```

### Dependency Notes

- **RSS parsing requires library management:** Can't manage subscriptions without ability to ingest feeds
- **Audio playback requires minutes tracking:** The core stats feature depends on playback events
- **Minutes watched enables all aggregate stats:** Most listened rankings and time grouping depend on raw time data
- **Time-grouped stats enhance streak/session analytics:** Grouping provides the foundation for period-based insights

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] RSS parsing and feed management — basic subscribe to podcasts
- [ ] Audio playback with standard controls — play, pause, seek, speed
- [ ] Episode progress tracking — resume where left off
- [ ] Minutes watched tracking — core differentiator, track listening time
- [ ] Most listened podcasts ranking — top shows by time
- [ ] Time-grouped statistics (week/month/year) — core to stats value

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Most listened episodes ranking — episode-level insights
- [ ] Minutes saved calculation — completion-based metrics
- [ ] Download for offline — mobile-first requirement
- [ ] Listening streak tracking — habit motivation
- [ ] Average session length — pattern insights

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Category/genre breakdown — requires genre metadata or tagging
- [ ] Time-of-day patterns — requires larger dataset
- [ ] Cross-device sync — complex, requires backend
- [ ] Smart playlists based on stats — if users want organization

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Minutes watched tracking | HIGH | MEDIUM | P1 |
| Most listened podcasts | HIGH | LOW | P1 |
| Time-grouped stats (week/month/year) | HIGH | MEDIUM | P1 |
| RSS parsing | HIGH | MEDIUM | P1 |
| Basic playback | HIGH | MEDIUM | P1 |
| Episode progress tracking | HIGH | LOW | P1 |
| Minutes saved | MEDIUM | MEDIUM | P2 |
| Most listened episodes | MEDIUM | LOW | P2 |
| Download for offline | MEDIUM | MEDIUM | P2 |
| Listening streak | MEDIUM | LOW | P2 |
| Average session length | MEDIUM | LOW | P2 |
| Total consumed count | LOW | LOW | P3 |
| Yearly projections | LOW | LOW | P3 |
| Genre breakdown | LOW | HIGH | P3 |
| Time-of-day patterns | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Apple Podcasts | Spotify | Pocket Casts | Our Approach |
|---------|---------------|----------|--------------|--------------|
| Minutes tracked | Partial (implicit) | Partial | Partial | Explicit tracking — core value |
| Time-grouped stats | Limited | Limited | Limited | Full week/month/year — our differentiator |
| Most listened | No ranking | Limited | Limited | Top podcasts/episodes ranking — our focus |
| Minutes saved | No | No | No | Unique to our value proposition |
| Listening streaks | No | Limited | No | Simple streak tracking |
| Completion rates | No | No | No | Track completion % per episode |

**Analysis:** Existing apps track some implicit data (completion, recent plays) but none provide explicit "minutes watched" with full time-grouping and ranking. This is our differentiation space — making listening analytics first-class.

## Sources

- Edison Research Infinite Dial 2026 (listening habits)
- Backlinko podcast statistics 2026 (market data)
- Transistor global podcast stats 2025-2026
- PodRewind consumption statistics 2026
- The Podcast App feature comparison 2026
- The Podosphere analytics tools comparison 2026

---
*Feature research for: Podcast app with statistics tracking*
*Researched: 2026-04-29*