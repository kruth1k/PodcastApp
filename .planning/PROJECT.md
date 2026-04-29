# PodcastStats

## What This Is

A self-hosted podcast player application with comprehensive statistics tracking. Users can subscribe to podcasts via RSS feeds, play episodes with full audio controls, and view detailed listening statistics (minutes watched, most listened podcasts/episodes, time-grouped analytics).

## Core Value

Users can view detailed listening statistics across all podcasts and episodes, with powerful filtering and grouping by time periods (daily, weekly, monthly, yearly).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Core podcast playback functionality
- [ ] Statistics tracking (minutes watched, minutes saved)
- [ ] Most listened podcast/episode tracking
- [ ] Time-grouped statistics (week, month, year)
- [ ] Podcast library management
- [ ] Episode download/save functionality
- [ ] Offline playback support

### Out of Scope

- [Social features] — Focus on personal stats, not social sharing
- [Podcast discovery] — Not a discovery platform, existing library focused
- [Advanced audio processing] — Standard playback only
- [Cross-device sync] — Backend complexity, defer to future

## Context

- Self-hosted application
- User requested Python backend with PostgreSQL
- Web: Next.js frontend
- Mobile: React Native (Expo)
- Statistics as core differentiator

## Constraints

- **[Platform]**: Self-hosted (Python + PostgreSQL)
- **[Frontend]**: Web (Next.js) + Mobile (React Native/Expo)
- **[Focus]**: Statistics-first design — all features serve the stats goal

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Statistics as core value | User explicitly wants stats-focused app | — Pending |
| Python FastAPI backend | User requested self-hosted Python backend | — Pending |
| PostgreSQL database | User preference for robust multi-user DB | — Pending |
| React Native mobile | User requested Expo for cross-platform mobile | — Pending |
| Subscription before playback | Phase 1: subscription, Phase 2: playback | — Pending |
| Bottom bar player | Spotify-style persistent player | — Pending |
| Skip intervals configurable | Defaults 15s forward, 30s back | — Pending |
| Full speed presets | 0.5x to 3x in 0.25x increments | — Pending |
| Offline + downloads | User requested offline playback support | — Pending |

---
*Last updated: 2026-04-29 after Phase 1 discuss*