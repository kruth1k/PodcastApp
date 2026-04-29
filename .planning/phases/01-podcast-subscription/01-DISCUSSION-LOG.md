# Phase 1: Podcast Subscription & Library - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 1-podcast-subscription
**Areas discussed:** Episode Source, Player UI Layout, Skip Intervals, Playback Speed, Stack Architecture, Offline Support

---

## Episode Source

| Option | Description | Selected |
|--------|-------------|----------|
| Sample audio URL | Hardcode test audio file | |
| URL input field | Users paste any audio URL | |
| Minimal podcast add | Basic RSS feed parsing in Phase 1 | |
| **Subscription first** | Podcast subscription before playback | ? |

**User's choice:** Podcast subscription should come BEFORE playback — users need content first, then play from their library.

---

## Player UI Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom bar | Spotify-style, persists across navigation | ? |
| Full-page player | Dedicated screen for playback | |
| Modal/overlay | Pops up over current content | |

**User's choice:** Bottom bar (Spotify-style)

---

## Skip Intervals

| Option | Description | Selected |
|--------|-------------|----------|
| 15 seconds | Industry standard | |
| 30 seconds | Some podcast apps use this | |
| **Configurable** | User can choose in settings, defaults 15/30 | ? |

**User's choice:** Configurable with defaults: 15s forward, 30s back

---

## Playback Speed Options

| Option | Description | Selected |
|--------|-------------|----------|
| Full preset range | 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x, 2.5x, 3x | ? |
| Core essentials | 1x, 1.5x, 2x only | |
| Continuous slider | Any speed 0.5x-3x | |

**User's choice:** Full preset range

---

## Stack Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Next.js + Prisma (local) | Original research recommendation | |
| **Python + PostgreSQL** | Self-hosted backend | ? |
| **React Native (Expo)** | Mobile app | ? |

**User's choice:** Python FastAPI backend with PostgreSQL, React Native for mobile, Next.js for web

---

## Offline Support

| Option | Description | Selected |
|--------|-------------|----------|
| **Downloads + offline playback** | User requested | ? |
| Not in scope | | |

**User's choice:** Need support for offline playback and episode downloads

---

## Deferred Ideas

Ideas mentioned during discussion that were noted for future phases:
- Playback controls ? Phase 2
- Event tracking ? Phase 4-6
- Background playback ? Phase 4+
- Download management ? Phase 2+
- Cross-device sync ? Out of scope (v1)
