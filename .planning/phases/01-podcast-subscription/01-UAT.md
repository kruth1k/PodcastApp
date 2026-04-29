# Phase 1 UAT: Podcast Subscription & Library

**Phase:** 01-podcast-subscription
**Status:** testing
**Created:** 2026-04-30
**Updated:** 2026-04-30

## Test Summary

| # | Test | Status | Result |
|---|------|--------|--------|
| 1 | Add podcast by RSS feed URL | pending | — |
| 2 | View list of subscribed podcasts | pending | — |
| 3 | Unsubscribe from podcast | pending | — |
| 4 | View episodes for podcast | pending | — |
| 5 | View episode details | pending | — |

## Current Test

**Test 1: Add podcast by RSS feed URL**

**Expected behavior:**
1. You enter a podcast RSS feed URL in the input field
2. Click "Add Podcast" button
3. The app fetches the RSS feed, parses it
4. Podcast appears in the list with its title, image, and episode count
5. Episodes are stored in the database

**Does this match what you see?**

---

## Setup Required

To test Phase 1, you need to start the services:

**Option 1: Docker**
```bash
docker-compose up -d
```

**Option 2: Manual (Backend only)**
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start PostgreSQL separately, then:
cd backend
set DATABASE_URL=postgresql://podcast_user:podcast_password@localhost:5432/podcast_stats
uvicorn app.main:app --reload
```

**Start Frontend:**
```bash
cd web
npm install
npm run dev
```

**Access:**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

---

*Last updated: 2026-04-30*