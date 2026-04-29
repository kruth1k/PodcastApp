# Roadmap: PodcastStats

**Created:** 2026-04-29
**Core Value:** Users can view detailed listening statistics across all podcasts and episodes, with powerful filtering and grouping by time periods (daily, weekly, monthly, yearly).

## Phases

- [ ] **Phase 1: Podcast Subscription & Library** - Subscribe to podcasts and view episode lists
- [ ] **Phase 2: Foundation & Playback** - Core audio playback engine with basic controls
- [ ] **Phase 3: Feed Management & Progress** - Refresh feeds and persist playback position
- [x] **Phase 4: Event Tracking & Background** - Capture listening events and background playback
- [ ] **Phase 5: Basic Statistics** - Total listening time and top podcasts/episodes
- [ ] **Phase 6: Time-Grouped Statistics** - Week/month/year grouped analytics
- [ ] **Phase 7: Library Search** - Search episodes within library

---

## Phase Details

### Phase 1: Podcast Subscription & Library

**Goal:** Users can subscribe to podcasts and browse their episode library

**Depends on:** Nothing (first phase)

**Requirements:** POD-01, POD-02, POD-03, LIB-01, LIB-03

**Success Criteria** (what must be TRUE):
1. User can add a podcast by entering an RSS feed URL and see it appear in their library
2. User can view a list of all their subscribed podcasts on one screen
3. User can unsubscribe from a podcast and it disappears from their library
4. User can view all episodes for a specific podcast sorted by date
5. User can view episode details including title, description, and duration

**Plans:** 2 plans

- [ ] 01-01-PLAN.md — Database schema and API endpoints
- [ ] 01-02-PLAN.md — RSS parsing service and frontend UI

**UI hint:** yes

---

### Phase 2: Foundation & Playback

**Goal:** Users can play podcast episodes with full audio controls

**Depends on:** Phase 1

**Requirements:** PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAY-05

**Success Criteria** (what must be TRUE):
1. User can play any episode and hear audio within 2 seconds of clicking play
2. User can pause playback and resume without audio gaps
3. User can seek to any position in the episode using a progress bar
4. User can skip forward 15 or 30 seconds with a single tap (configurable)
5. User can skip backward 15 or 30 seconds with a single tap (configurable)
6. User can adjust playback speed from 0.5x to 3x and hear the change immediately
7. Player displays as bottom bar (Spotify-style, persists across navigation)

**Plans:** 1 plan

- [x] 02-01-PLAN.md — Player foundation (PlayerStore, PlayerBar, controls)

**UI hint:** yes

---

### Phase 3: Feed Management & Progress

**Goal:** Users can refresh podcast feeds and resume playback from where they left off

**Depends on:** Phase 2

**Requirements:** POD-04, PLAY-06, LIB-02

**Success Criteria** (what must be TRUE):
1. User can manually refresh a podcast feed to see new episodes
2. User can close the app during an episode and return later to continue from the exact same position
3. User can mark an episode as played or unplayed to track their progress

**Plans:** 1 plan

- [ ] 03-01-PLAN.md — Feed refresh, position persistence, played status

**UI hint:** yes

---

### Phase 4: Event Tracking & Background

**Goal:** System captures all listening events and audio plays in background

**Depends on:** Phase 3

**Requirements:** PLAY-07, STAT-01

**Success Criteria** (what must be TRUE):
1. Audio continues playing when user minimizes or switches away from the app
2. System accurately tracks minutes watched for each episode session
3. User can control playback from a system notification when app is backgrounded

**Plans:** 1 plan

- [x] 04-01-PLAN.md — Background playback and event tracking

**UI hint:** yes

---

### Phase 5: Basic Statistics

**Goal:** Users can view their total listening time and top listened content

**Depends on:** Phase 4

**Requirements:** STAT-02, STAT-03, STAT-04

**Success Criteria** (what must be TRUE):
1. User can view total minutes listened across all time on a statistics dashboard
2. User can see a ranked list of most listened podcasts sorted by time spent
3. User can see a ranked list of most listened episodes sorted by time spent

**Plans:** TBD

**UI hint:** yes

---

### Phase 6: Time-Grouped Statistics

**Goal:** Users can view statistics grouped by week, month, and year

**Depends on:** Phase 5

**Requirements:** STAT-05, STAT-06, STAT-07

**Success Criteria** (what must be TRUE):
1. User can view listening statistics filtered by week with daily breakdown
2. User can view listening statistics filtered by month with daily breakdown
3. User can view listening statistics filtered by year with monthly breakdown
4. User can switch between time periods without losing context

**Plans:** TBD

**UI hint:** yes

---

### Phase 7: Library Search

**Goal:** Users can search for episodes within their entire library

**Depends on:** Phase 1

**Requirements:** LIB-04

**Success Criteria** (what must be TRUE):
1. User can search for episodes by title and see results appear as they type
2. User can click a search result and go directly to that episode
3. Search works across all subscribed podcasts simultaneously

**Plans:** TBD

**UI hint:** yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Podcast Subscription & Library | 2/2 | ✅ Completed | 2026-04-30 |
| 2. Foundation & Playback | 1/1 | ✅ Completed | 2026-04-30 |
| 3. Feed Management & Progress | 1/1 | ✅ Completed | 2026-04-30 |
| 4. Event Tracking & Background | 1/1 | ✅ Completed | 2026-04-30 |
| 5. Basic Statistics | 0/1 | Not started | - |
| 6. Time-Grouped Statistics | 0/1 | Not started | - |
| 7. Library Search | 0/1 | Not started | - |

---

## Coverage

- **v1 Requirements:** 21 total
- **Mapped to phases:** 21 ✓
- **Unmapped:** 0 ✓

| Requirement | Phase |
|-------------|-------|
| POD-01 | Phase 1 |
| POD-02 | Phase 1 |
| POD-03 | Phase 1 |
| LIB-01 | Phase 1 |
| LIB-03 | Phase 1 |
| PLAY-01 | Phase 2 |
| PLAY-02 | Phase 2 |
| PLAY-03 | Phase 2 |
| PLAY-04 | Phase 2 |
| PLAY-05 | Phase 2 |
| POD-04 | Phase 3 |
| PLAY-06 | Phase 3 |
| LIB-02 | Phase 3 |
| PLAY-07 | Phase 4 |
| STAT-01 | Phase 4 |
| STAT-02 | Phase 5 |
| STAT-03 | Phase 5 |
| STAT-04 | Phase 5 |
| STAT-05 | Phase 6 |
| STAT-06 | Phase 6 |
| STAT-07 | Phase 6 |
| LIB-04 | Phase 7 |

---

*Roadmap created: 2026-04-29*
*Updated: 2026-04-29 - Phase order swapped (Subscription first)*