# Phase 12: Change Charts to Graphs - Context

**Phase:** 12  
**Goal:** Replace bar charts with line/area graphs + add time saved metric

---

## Prior Context

- Phase 11 just completed hydration fixes
- No prior CONTEXT.md for this phase

---

## Reusable Assets Found

| Asset | Location | Reuse? |
|-------|----------|--------|
| CSS bar charts | StatsChart.tsx | Replace (not reusable) |
| playback_rate field | statsStore.ts:327 | ✅ Already captured in events |
| Progress events | statsStore.ts | ✅ Already stored with rate |
| Stats aggregation | statsStore.ts | ✅ Can add time saved calculation |

---

## Technical Decisions

### 1. Chart Library: Recharts

**Decision:** Install and use Recharts for line/area graphs
- Already standard in React ecosystem
- Works with Next.js 15 / React 19
- Responsive by default
- Install: `npm install recharts`

### 2. Time Saved Calculation

**Decision:** Calculate from existing progress events

Each progress event in statsStore already captures:
- `playback_rate` (1, 1.5, 2, etc.)
- `position_seconds`
- `timestamp`

**Algorithm:**
1. For each progress event pair, calculate the time interval
2. Interval = (current_event.timestamp - previous_event.timestamp) / 1000 (in seconds)
3. Saved time = interval × (1 - 1/playback_rate)
4. Sum all intervals for total time saved

**Note:** Progress events fire every 25+ seconds (PROGRESS_MIN_INTERVAL = 25000). This is accurate enough.

### 3. Display: Add to Stats Page

Add "Time Saved" card next to other stats showing:
- Total time saved (formatted as Xh Ym)
- (Optional) Average playback speed used

---

## Implementation Plan

1. Install Recharts
2. Update StatsChart.tsx:
   - Replace CSS bars with `<AreaChart />` or `<LineChart />`
   - Keep navigation (week/month/year)
   - Keep responsive container
3. Update statsStore.ts:
   - Add `getTimeSaved()` function to calculate total
4. Update stats page:
   - Add Time Saved card

---

## Files to Modify

| File | Change |
|------|--------|
| `web/package.json` | Add recharts |
| `web/src/components/StatsChart.tsx` | Replace bars with Recharts |
| `web/src/stores/statsStore.ts` | Add getTimeSaved() |
| `web/src/app/stats/page.tsx` | Add Time Saved card |

---

## Gray Areas / Decisions Made

All decisions made:
- ✅ Use Recharts (not Chart.js or custom SVG)
- ✅ Calculate from progress events (not heartbeat)
- ✅ Display on stats page (not player)
- ✅ Line chart (not area chart) - cleaner look

---

## Ready for Implementation

Implementation is straightforward:
1. Install dependency
2. Replace chart rendering
3. Add calculation function
4. Add display card

No further discussion needed - proceed with implementation.

**Next step:** Start implementing → Run `/gsd-execute-phase 12` or begin coding.