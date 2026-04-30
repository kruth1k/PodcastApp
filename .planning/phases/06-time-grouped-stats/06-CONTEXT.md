# Phase 6: Time-Grouped Statistics - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can view their listening statistics grouped by time periods (week, month, year) in both chart and calendar formats. This builds on Phase 5's basic statistics by adding time-based grouping and visualization.

This is Phase 6 — adds visualization to the stats from Phase 4-5.
</domain>

<decisions>
## Implementation Decisions

### Data Aggregation (D-42)

- **Pre-aggregation** approach selected over on-the-fly
  - Reuse existing dailyStats, group into weekly/monthly/yearly
  - Recalculate only when new events arrive (in aggregateDailyStats)
  - Faster UI rendering, responsive even with 10k events

### Storage Structure
```typescript
// New store methods
interface WeeklyStats { week: string; total_seconds: number; sessions: number; }
interface MonthlyStats { month: string; total_seconds: number; sessions: number; }
interface YearlyStats { year: string; total_seconds: number; sessions: number; }

// Week format: "2026-W17" (ISO week)
// Month format: "2026-04"
// Year format: "2026"
```

### Visualization (D-43)

- **Two views**: Chart + Calendar (both implemented)
- Chart view: Bar chart showing time per period (week/month/year)
- Calendar view: Heatmap grid showing daily activity
- View toggle: Switch between Chart | Calendar

### UI Structure
```
Stats Page:
├── Time Period Filter (7 Days, 30 Days, Year, All)
├── View Toggle (Chart | Calendar)
├── [Chart View]
│   └── Bar chart by week/month/year
└── [Calendar View]
    └── Heatmap grid by day
```

</decisions>

<canonical_refs>
## Canonical References

### Project Context
- .planning/PROJECT.md — Core value: Statistics-first podcast app
- .planning/REQUIREMENTS.md — STAT-05, STAT-06, STAT-07
- .planning/ROADMAP.md — Phase structure

### Prior Context
- .planning/phases/05-basic-stats/05-CONTEXT.md — Stats implementation

### Existing Code
- web/src/stores/statsStore.ts — Event storage, dailyStats aggregation
- web/src/app/stats/page.tsx — Stats page with time filtering
</canonical_refs>

<existing_code>
## Existing Code Insights

### Phase 5 Code (Reusable)
- statsStore.ts: getTotalListeningTime(period), getPodcastStats(period), getEpisodeStats(period)
- statsStore.ts: dailyStats, aggregateDailyStats()
- stats/page.tsx: TIME_PERIODS filter, podcast/episode display

### Phase 6 New Components
- stores/statsStore.ts: Add weeklyStats, monthlyStats, yearlyStats + getters
- app/stats/page.tsx: Add Chart view component, Calendar view component
- components/StatsChart.tsx (NEW): Bar chart visualization
- components/StatsCalendar.tsx (NEW): Calendar heatmap
</existing_code>

<specifics>
## Implementation Ideas

### Week/Month/Year Aggregation
```typescript
getWeeklyStats: () => {
  const { dailyStats } = get();
  const byWeek = new Map<string, WeeklyStats>();
  for (const stat of dailyStats) {
    const date = new Date(stat.date);
    const week = getISOWeek(date); // "2026-W17"
    const existing = byWeek.get(week) || { week, total_seconds: 0, sessions: 0 };
    existing.total_seconds += stat.total_seconds;
    existing.sessions += stat.session_count;
    byWeek.set(week, existing);
  }
  return Array.from(byWeek.values()).sort((a,b) => a.week.localeCompare(b.week));
}
```

### Chart View (recharts or simple CSS bars)
- Simple CSS bars: <div style={{height: `${pct}%`}}></div>
- Show last 12 weeks or 12 months

### Calendar Heatmap
- 7 columns (days) x 5-6 rows (weeks) grid
- Color intensity based on listening time
- Tooltip shows date + time

</specifics>

<deferred>
## Deferred Ideas

- Export statistics as CSV/PDF
- Compare statistics across time periods
- Listening streak tracking
- Cross-podcast trends

</deferred>

---

*Phase: 06-time-grouped-stats*
*Context gathered: 2026-04-30*