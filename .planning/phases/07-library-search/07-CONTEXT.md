# Phase 7: Library Search - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

User can search for podcasts and episodes within their library, plus discover new podcasts. Combines library search with podcast discovery in one unified search experience.

This is Phase 7 - final phase of v1.
</domain>

<decisions>
## Implementation Decisions

### Search Location (D-50)
- **Home page**: Search bar at top of page
- **Podcast detail**: Search bar to filter episodes within that podcast

### Two-Level Search (D-51)
1. **Global search** (home): Searches podcast titles
2. **Episode search** (podcast detail): Searches episodes within that podcast

### Search Display (D-52)
- **Live dropdown**: Results appear as user types (debounced ~300ms)
- Shows up to 10 results in dropdown

### Search Behavior (D-53)
- **Case insensitive**: "tech" matches "Tech", "TECH", "tech"
- **Partial matching**: "pod" matches "Podcast", "Podcasts", "podcast"

### Podcast Discovery (D-54)
- Search searches BOTH:
  - Podcasts in user's library (local)
  - Podcasts NOT in library (via API search if no local match)
- This enables podcast discovery without separate page

</decisions>

<canonical_refs>
## Canonical References

### Project Context
- .planning/PROJECT.md — Core value: Statistics-first podcast app
- .planning/REQUIREMENTS.md — LIB-04: "User can search episodes within their library"
- .planning/ROADMAP.md — Phase 7

### Prior Context
- .planning/phases/06-time-grouped-stats/06-CONTEXT.md — Previous phase context
</canonical_refs>

<existing_code>
## Existing Code Insights

### Home Page (page.tsx)
- Already has search input for adding podcasts (feed URL)
- Need to add new search functionality

### Podcast Store (podcastStore.ts)
- Has podcasts array with episodes
- Need to add search filtering methods

### API (api.ts)
- Already has getPodcasts(), getEpisodes(), addPodcast()
- May need new search endpoint for podcast discovery (or use existing)

</existing_code>

<specifics>
## Implementation Ideas

### Home Page Search
```tsx
// Debounced search input
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

// Search podcasts in library + external search
useEffect(() => {
  if (searchQuery.length < 2) return;
  const timer = setTimeout(() => {
    // Search local podcasts
    const local = podcasts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // If no local match, search externally
    if (local.length === 0) {
      searchExternalPodcasts(searchQuery);
    }
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### Episode Search (within podcast)
- Similar logic but filters podcast.episodes array

</specifics>

<deferred>
## Deferred Ideas

- Search history/recent searches
- Search by host/author name
- Advanced filters (genre, duration, date)
- Save search as "smart playlist"

</deferred>

---

*Phase: 07-library-search*
*Context gathered: 2026-04-30*
*Decisions captured and ready for planning*