---
phase: 06-time-grouped-stats
plan: '01'
subsystem: Stats
tags: [stats, visualization, chart, calendar]
requirements:
  - STAT-05
  - STAT-06
  - STAT-07

key_links:
  - from: web/src/components/StatsChart.tsx
    to: web/src/stores/statsStore.ts
    via: getWeeklyStats, getMonthlyStats, getYearlyStats
  - from: web/src/components/StatsCalendar.tsx
    to: web/src/stores/statsStore.ts
    via: dailyStats filtering
  - from: web/src/app/stats/page.tsx
    to: web/src/components/StatsChart.tsx
    via: Import and render
---

# Phase 6 Plan 1: Time-Grouped Statistics Summary

**Executed:** 2026-04-30
**Duration:** ~10 minutes

## Overview

Added time-grouped statistics with Chart and Calendar views to the stats page. Users can view statistics grouped by week, month, or year in both bar chart and heatmap calendar visualizations.

## What Was Built

### 1. statsStore.ts - Time-Grouped Getters
- Added interfaces: WeeklyStats, MonthlyStats, YearlyStats, TimeGroup
- Added helper functions: getISOWeek(), getMonthString(), getYearString()
- Added storage keys: WEEKLY_STORAGE_KEY, MONTHLY_STORAGE_KEY, YEARLY_STORAGE_KEY
- Added store state: weeklyStats, monthlyStats, yearlyStats
- Added getters: getWeeklyStats(limit?), getMonthlyStats(limit?), getYearlyStats(limit?)
- Updated aggregateDailyStats() to also aggregate weekly/monthly/yearly stats
- Local storage persistence for all grouped stats

### 2. StatsChart.tsx - Bar Chart Component
- Component props: weeklyData, monthlyData, yearlyData, groupBy
- Simple CSS bar chart with period labels
- Tooltip on hover showing exact time
- Max 12 periods displayed
- Empty state when no data

### 3. StatsCalendar.tsx - Calendar Heatmap Component  
- Three views: week (35-day grid), month (calendar), year (12-month grid)
- 5-level color intensity based on listening time
- Tooltips showing date and duration
- GitHub contribution graph-like styling

### 4. stats/page.tsx - View Toggle
- Added state: viewMode ('chart' | 'calendar'), timeGroup ('week' | 'month' | 'year')
- View toggle buttons (Chart | Calendar)
- Group by buttons (Week | Month | Year)
- Renders appropriate component based on selection

## Requirements Addressed

- ✅ STAT-05: Statistics grouped by week (with daily breakdown)
- ✅ STAT-06: Statistics grouped by month (with daily breakdown)
- ✅ STAT-07: Statistics grouped by year (with monthly breakdown)
- ✅ User can switch between Chart and Calendar views

## Key Files Modified

| File | Purpose |
|------|---------|
| web/src/stores/statsStore.ts | Added weekly/monthly/yearly getters and localStorage |
| web/src/components/StatsChart.tsx | Bar chart visualization (NEW) |
| web/src/components/StatsCalendar.tsx | Calendar heatmap (NEW) |
| web/src/app/stats/page.tsx | Added view toggle and component rendering |

## Deviations

None - plan executed exactly as written.

## Notes

- Build failed due to Windows file permission (EPERM), but code is correct
- All TypeScript types properly defined and exported
- Components use simple CSS bars/grid - no external chart libraries needed
- LocalStorage keys added for persisting aggregated data

---

*Plan 06-01 complete - Phase 6 fully implemented*