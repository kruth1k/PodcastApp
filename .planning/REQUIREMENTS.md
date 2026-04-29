# Requirements: PodcastStats

**Defined:** 2026-04-29
**Core Value:** Users can view detailed listening statistics across all podcasts and episodes, with powerful filtering and grouping by time periods (daily, weekly, monthly, yearly).

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Podcast Management

- [ ] **POD-01**: User can add podcast by RSS feed URL
- [ ] **POD-02**: User can view list of subscribed podcasts
- [ ] **POD-03**: User can unsubscribe from a podcast
- [ ] **POD-04**: User can refresh podcast feeds to get new episodes

### Playback

- [ ] **PLAY-01**: User can play an episode with play/pause control
- [ ] **PLAY-02**: User can seek to specific position in episode
- [ ] **PLAY-03**: User can skip forward (15s/30s configurable)
- [ ] **PLAY-04**: User can skip backward (15s/30s configurable)
- [ ] **PLAY-05**: User can adjust playback speed (0.5x to 3x)
- [ ] **PLAY-06**: Episode playback position persists across sessions
- [ ] **PLAY-07**: Audio continues playing in background when app is minimized

### Library

- [ ] **LIB-01**: User can view list of episodes for each podcast
- [ ] **LIB-02**: User can mark episode as played/unplayed
- [ ] **LIB-03**: User can view episode details (title, description, duration)
- [ ] **LIB-04**: User can search episodes within their library

### Statistics

- [ ] **STAT-01**: System tracks minutes watched for each episode session
- [ ] **STAT-02**: User can view total minutes listened across all time
- [ ] **STAT-03**: User can view most listened podcasts (ranked by time)
- [ ] **STAT-04**: User can view most listened episodes (ranked by time)
- [ ] **STAT-05**: User can view statistics grouped by week
- [ ] **STAT-06**: User can view statistics grouped by month
- [ ] **STAT-07**: User can view statistics grouped by year

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Downloads

- **DOWN-01**: User can download episode for offline listening
- **DOWN-02**: User can view download progress
- **DOWN-03**: User can delete downloaded episodes to free storage

### Advanced Statistics

- **STAT-08**: User can view minutes saved (completion-based time)
- **STAT-09**: User can view listening streak (consecutive days)
- **STAT-10**: User can view average session length
- **STAT-11**: User can view completion rate per episode

### Playback

- **PLAY-08**: User can create playback queue
- **PLAY-09**: User can auto-play next episode in series

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Social sharing of statistics | Out of scope per PROJECT.md — personal stats focus |
| Podcast discovery/browse | Focus on existing library, not new content discovery |
| Cross-device sync | Backend complexity, defer to future |
| Video podcast support | Audio-only focus for v1 |
| AI transcripts/summaries | Not aligned with stats-first value |
| User-created playlists | Complexity without stats value |
| Comments/reviews | Community features out of scope |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| POD-01 | Phase 1 | Pending |
| POD-02 | Phase 1 | Pending |
| POD-03 | Phase 1 | Pending |
| POD-04 | Phase 2 | Pending |
| PLAY-01 | Phase 1 | Pending |
| PLAY-02 | Phase 1 | Pending |
| PLAY-03 | Phase 1 | Pending |
| PLAY-04 | Phase 1 | Pending |
| PLAY-05 | Phase 1 | Pending |
| PLAY-06 | Phase 2 | Pending |
| PLAY-07 | Phase 2 | Pending |
| LIB-01 | Phase 1 | Pending |
| LIB-02 | Phase 2 | Pending |
| LIB-03 | Phase 1 | Pending |
| LIB-04 | Phase 2 | Pending |
| STAT-01 | Phase 2 | Pending |
| STAT-02 | Phase 3 | Pending |
| STAT-03 | Phase 3 | Pending |
| STAT-04 | Phase 3 | Pending |
| STAT-05 | Phase 3 | Pending |
| STAT-06 | Phase 3 | Pending |
| STAT-07 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ?

---
*Requirements defined: 2026-04-29*
*Last updated: 2026-04-29 after initial definition*
