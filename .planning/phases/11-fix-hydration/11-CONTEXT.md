# Phase 11: Fix Hydration Issue - Context

**Phase:** 11  
**Goal:** Fix React hydration errors caused by server/client HTML mismatch

---

## Prior Context

This is the first phase after v1 delivery (Phase 10). No prior CONTEXT.md files exist.

---

## Hydration Issue Analysis

### Error Message
```
Hydration failed because the server rendered HTML didn't match the client
```

### Root Causes Identified

| File | Line | Issue | Severity |
|------|------|-------|----------|
| `EpisodeList.tsx` | 24 | `useState(getInitialSortOrder)` - initial state reads localStorage during render | HIGH |
| `EpisodeList.tsx` | 11 | `getInitialSortOrder()` accesses localStorage on line 11 | HIGH |
| `EpisodeCard.tsx` | 42 | `played` computed during render reads localStorage | MEDIUM |

### Code Details

**EpisodeList.tsx - Line 24:**
```typescript
const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>(getInitialSortOrder);
```
- Server: returns 'newest' (line 10)
- Client: may return 'oldest' if saved in localStorage
- Result: HTML mismatch → hydration error

**EpisodeCard.tsx - Line 42:**
```typescript
const played = playedEpisodes.has(episode.id) || (typeof window !== 'undefined' && localStorage.getItem(`podcast_played_${episode.id}`) === 'true');
```
- Server: `typeof window === 'undefined'` → only `playedEpisodes.has()` evaluated
- Client: full expression evaluated → may include localStorage result
- Result: different `played` value on server vs client

---

## Gray Areas / Decisions Needed

### 1. How to fix EpisodeList sort order hydration?
**Option A:** Use useEffect to load sort order after mount (client-only)
- Pro: Simple fix
- Con: Flash of default sort on mount

**Option B:** Accept 'newest' as default, ignore localStorage until interaction
- Pro: No flash, matches server
- Con: User preference lost on first load

**Option C:** Use zustand/cookie-based state that matches server/client
- Pro: Preserves preference
- Con: More complex, requires store changes

### 2. How to fix EpisodeCard played status hydration?
**Option A:** Move localStorage check to useEffect
- Pro: Fixes hydration
- Con: Slight delay before showing played status

**Option B:** Use store's playedEpisodes Set only (remove localStorage check)
- Pro: No hydration issue, store is client-side only
- Con: Only tracks episodes played in current session

**Option C:** Accept that played status may be wrong on first render, fix in effect
- Pro: Simple
- Con: Minor visual inconsistency

---

## Pattern to Follow

All client-only data (localStorage, window, etc.) must either:
1. Be accessed inside `useEffect`, OR
2. Have a `mounted` check before rendering

Example from PlayerBar.tsx (correct pattern):
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
if (!mounted) return null;  // Prevent hydration mismatch
```

---

## Next Steps

1. **Plan:** Create 11-01-PLAN.md with fix implementation
2. **Implement:** Fix the three identified hydration issues
3. **Verify:** Test by running dev server and checking browser console

---

## Ready to Plan

The identified issues are straightforward. Once the plan is created, implementation should be quick (estimated 1-2 hours including testing).

**Does the plan proceed with these fixes, or are there other hydration issues you'd like me to investigate first?**