# Phase 9 Context - Loading Indicator, Episode Sorting & Dark Mode

## Prior Context
- Phase 8 completed (Login & Cross-Device Sync)
- Frontend: Next.js 15, Tailwind CSS, Zustand state management
- Backend: FastAPI, PostgreSQL

## Phase 9 Requirements

### LOAD-01: Loading Indicator
- Show spinner/indicator when user clicks play on episode before audio starts
- Current state: No loading indicator - audio starts silently

### SORT-01, SORT-02, SORT-03: Episode Sorting
- Currently: Episodes sorted newest first (by published_at)
- Need: Toggle to sort oldest first
- Persist sort preference in localStorage

### THEME-01, THEME-02: Dark Mode
- Add theme toggle in header
- Persist in localStorage
- Use Tailwind `darkMode: 'class'` strategy

## Technical Decisions (Locked)

### Loading Indicator Implementation
1. Add `isLoading` boolean to playerStore
2. Set `isLoading = true` when `playEpisode()` is called
3. Set `isLoading = false` when Howler `onload` event fires
4. Display spinner in PlayerBar when loading

### Episode Sorting Implementation
1. Add `sortOrder` ('newest' | 'oldest') to podcastStore
2. Store in localStorage key: `podcast_sort_order`
3. In EpisodeList, toggle button with current sort label
4. Sort happens in `getEpisodes()` or at render time

### Dark Mode Implementation
1. Create `useThemeStore` with Zustand
2. Store theme in localStorage key: `podcast_theme`
3. Add `darkMode: 'class'` to tailwind.config.js
4. Apply `dark` class to document root based on theme
5. Add toggle button in header (page.tsx header section)
6. Update key components with dark: classes

## Gray Areas (Need Discussion)

None - all implementation details are clear from analyzing existing patterns.

## Existing Patterns to Follow
- Use same localStorage pattern as `podcast_position_${episodeId}`
- Use Zustand store pattern from `playerStore.ts`, `podcastStore.ts`
- Use Tailwind dark mode the same way as existing light classes

## Files to Modify
1. `src/stores/playerStore.ts` - add isLoading state
2. `src/stores/podcastStore.ts` - add sortOrder
3. `src/stores/themeStore.ts` - new file for theme
4. `tailwind.config.js` - add darkMode: 'class'
5. `src/components/PlayerBar.tsx` - add loading spinner
6. `src/components/EpisodeList.tsx` - add sort toggle
7. `src/app/page.tsx` - add theme toggle button

## Success Criteria Check
- [ ] User sees loading spinner when clicking play
- [ ] User can toggle sort to oldest first
- [ ] Sort persists on page reload
- [ ] User can toggle dark mode
- [ ] Theme persists on page reload