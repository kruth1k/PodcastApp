# Phase 13: Fix UI Issues - Context

**Phase:** 13  
**Goal:** Fix dark mode text visibility and episode sorting

---

## Prior Context

- Phase 12 just completed (charts to graphs + time saved)
- No prior CONTEXT.md for this phase

---

## Implementation Decisions

### 1. Dark Mode Fix

**Decision:** Add `dark:text-gray-300` class to username/email span

**File:** `web/src/app/page.tsx`

Simple CSS class addition - no further discussion needed.

### 2. Episode Sorting

**Decision:** Add `sort_by` parameter to backend API with `newest`/`oldest` options

**Backend changes:**
- `crud.py`: Add sort_by param to `get_episodes()`, toggle between `.asc()` and `.desc()`
- `routers/episodes.py`: Accept sort_by query param

**Frontend changes:**
- `api.ts`: Pass sort_by to backend
- `EpisodeList.tsx`: Pass sortOrder to API when fetching

**Pagination behavior:**
- Oldest sort: Page 1 = oldest episode, Page N = newest episode
- Newest sort: Page 1 = newest episode, Page N = oldest episode

---

## Edge Cases Considered

| Case | Decision |
|------|----------|
| Null published_at | Default SQL ORDER handles nulls - they'll appear at end |
| No episodes | Return empty list - no change needed |
| Sort persisted? | Already using localStorage for sort preference |

---

## Gray Areas - None

All decisions are straightforward:
1. ✅ Dark mode fix is simple CSS
2. ✅ Backend needs sort parameter (already has all other infrastructure)
3. ✅ Pagination works naturally - offset/limit applies after sort

---

## Files to Modify

| File | Change |
|------|--------|
| `web/src/app/page.tsx` | Add dark mode class |
| `backend/app/crud.py` | Add sort_by parameter |
| `backend/app/routers/episodes.py` | Accept sort_by query param |
| `web/src/lib/api.ts` | Pass sort_by to API |
| `web/src/components/EpisodeList.tsx` | Pass sort order to API |

---

## Ready for Implementation

No gray areas to discuss - proceed with implementation.

**Next step:** Start coding → Implement dark mode fix + sorting support