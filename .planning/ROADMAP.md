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
- [ ] **Phase 8: Login & Cross-Device Sync** - User accounts with cloud sync
- [ ] **Phase 9: Loading Indicator, Episode Sorting & Dark Mode** - Loading state, sort options, and theme toggle
- [ ] **Phase 10: Resume Playback** - Show last played episode in player bar on login
- [ ] **Phase 11: Fix Hydration Issue** - Fix server/client HTML mismatch errors
- [ ] **Phase 12: Change Charts to Graphs** - Replace bar charts with line/area graphs

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

**Plans:** 1 plan

- [x] 06-01-PLAN.md — Time-grouped statistics (Chart/Calendar views)

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

**Plans:** 1 plan

- [x] 07-01-PLAN.md — Library search (podcastStore, SearchResults, home page)

**UI hint:** yes

---

## Phase 8: Login & Cross-Device Sync

**Goal:** Users can create accounts and sync their data across devices

**Depends on:** Phase 7

**Requirements:** AUTH-01, AUTH-02, SYNC-01

**Success Criteria** (what must be TRUE):
1. User can create an account with email and password
2. User can log in with their credentials
3. User's podcasts, episodes, and statistics sync across devices
4. App works offline without login (guest mode)
5. Existing guest data auto-migrates on account creation

**Plans:** 1 plan

- [x] 08-01-PLAN.md — Login & Cross-Device Sync implementation (GSD format)

**UI hint:** yes

---

## Phase 9: Loading Indicator, Episode Sorting & Dark Mode

**Goal:** Add visual feedback for audio loading, sorting options for episodes, and theme toggle

**Depends on:** Phase 8

**Success Criteria** (what must be TRUE):
1. User sees a loading indicator when clicking play on an episode before audio starts
2. User can sort episodes by newest first (current default)
3. User can sort episodes by oldest first (reverse chronological)
4. Sort preference persists during session
5. User can toggle between light and dark mode
6. Theme preference persists across sessions

**Plans:** 1 plan

- [x] 09-01-PLAN.md — Loading indicator, episode sorting, and dark mode

**UI hint:** yes

---

## Phase 10: Resume Playback

**Goal:** Show last played episode in player bar when user logs in

**Depends on:** Phase 9

**Success Criteria** (what must be TRUE):
1. User sees the episode they were last listening to in the player bar when they log back in
2. If it's the user's first login, nothing shows in the player bar
3. The episode resumes from the last saved position

**Plans:** 1 plan

- [x] 10-01-PLAN.md — Resume playback on login

**UI hint:** yes

---

## Phase 11: Fix Hydration Issue

**Goal:** Fix React hydration errors caused by server/client HTML mismatch

**Depends on:** Phase 10

**Success Criteria** (what must be TRUE):
1. No hydration errors in browser console
2. Server-rendered HTML matches client HTML
3. All client-side dynamic content properly handled with useEffect or mounted check

**Plans:** 1 plan

- [ ] 11-01-PLAN.md — Fix hydration issues

**UI hint:** yes

---

## Phase 12: Change Charts to Graphs

**Goal:** Replace bar chart visualization with line/area graphs + add time saved feature

**Depends on:** Phase 11

**Success Criteria** (what must be TRUE):
1. Statistics page shows data as line/area graphs instead of bar charts
2. User can view listening trends over time (daily, weekly, monthly)
3. Graphs are responsive and work on different screen sizes
4. Show "time saved" metric - calculated from playback speed (e.g., 2x speed = 50% time saved)

**Plans:** 1 plan

- [ ] 12-01-PLAN.md — Change charts to graphs + time saved feature

**UI hint:** yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Podcast Subscription & Library | 2/2 | ✅ Completed | 2026-04-30 |
| 2. Foundation & Playback | 1/1 | ✅ Completed | 2026-04-30 |
| 3. Feed Management & Progress | 1/1 | ✅ Completed | 2026-04-30 |
| 4. Event Tracking & Background | 1/1 | ✅ Completed | 2026-04-30 |
| 5. Basic Statistics | 1/1 | ✅ Completed | 2026-04-30 |
| 6. Time-Grouped Statistics | 1/1 | ✅ Completed | 2026-04-30 |
| 7. Library Search | 1/1 | 🔄 Ready | - |
| 8. Login & Cross-Device Sync | 0/1 | Pending | - |

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