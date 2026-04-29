# PodcastStats — Project Guide

**Status:** Planning
**Focus:** Phase 1 - Foundation & Playback

## Project Context

**Core Value:** Users can view detailed listening statistics across all podcasts and episodes, with powerful filtering and grouping by time periods (daily, weekly, monthly, yearly).

**Current Phase:** Not started — Run /gsd-discuss-phase 1 to begin

---

## Workflow Commands

| Command | When to Use |
|---------|-------------|
| /gsd-discuss-phase 1 | Start Phase 1 — gather context and clarify approach |
| /gsd-plan-phase 1 | Skip discussion, plan directly |
| /gsd-ui-phase 1 | Generate UI design contract (if Phase 1 has UI) |
| /gsd-progress | Check current project status |
| /gsd-health | Verify phase goals are being met |

---

## Configuration

- **Mode:** YOLO (auto-approve)
- **Granularity:** Fine (7 phases, 5-10 plans each)
- **Execution:** Sequential
- **Workflow Agents:** Research ?, Plan Check ?, Verifier ?
- **Model:** Inherit (session default)

---

## Phase Structure

| Phase | Focus | Requirements |
|-------|-------|--------------|
| 1 | Foundation & Playback | PLAY-01 to PLAY-05 |
| 2 | Podcast Subscription & Library | POD-01, POD-02, POD-03, LIB-01, LIB-03 |
| 3 | Feed Management & Progress | POD-04, PLAY-06, LIB-02 |
| 4 | Event Tracking & Background | PLAY-07, STAT-01 |
| 5 | Basic Statistics | STAT-02, STAT-03, STAT-04 |
| 6 | Time-Grouped Statistics | STAT-05, STAT-06, STAT-07 |
| 7 | Library Search | LIB-04 |

---

## Research Findings

Key architecture insight: **Statistics must be captured at the playback layer from day one**, with EventCaptureService receiving callbacks directly from MediaPlayerService.

**Stack:** Next.js 15, howler.js, Prisma + SQLite, Zustand

---

## Getting Started

1. Run /gsd-discuss-phase 1 to begin execution
2. Or /gsd-plan-phase 1 to skip to planning

---

*Generated: 2026-04-29*
