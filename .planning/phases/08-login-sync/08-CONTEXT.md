# Phase 8: Login & Cross-Device Sync - Implementation Context

**Phase:** 8 - Login & Cross-Device Sync  
**Date:** 2026-04-30  
**Status:** Planning

---

## Current State

### What's Already Built (Phases 1-7)

| Component | Current Implementation |
|-----------|----------------------|
| **Database** | PostgreSQL with Podcast, Episode tables (no user) |
| **Authentication** | None - fully open access |
| **Statistics** | Stored in localStorage (frontend only) |
| **Frontend** | Next.js 15, Zustand stores |

### Data Flow (Current)
```
Frontend → API (FastAPI) → PostgreSQL
              ↓
         localStorage (stats)
```

---

## Phase 8 Implementation Plan

### 1. Database Changes

**New Tables:**

```python
# User table
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)  # bcrypt hash
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    podcasts = relationship("Podcast", back_populates="user", cascade="all, delete-orphan")
    listening_events = relationship("ListeningEvent", back_populates="user", cascade="all, delete-orphan")
    playback_positions = relationship("PlaybackPosition", back_populates="user", cascade="all, delete-orphan")
```

**Modified Tables:**

| Table | Change |
|-------|--------|
| `podcasts` | Add `user_id` FK to users (nullable for guest podcasts), add unique constraint (user_id + feed_url) |
| `episodes` | Already linked to podcasts, inherits user via podcast |
| (new) `listening_events` | Store events in DB when logged in |
| (new) `playback_positions` | Store position per episode per user |

### 2. API Changes

**New Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account (email + password) |
| `/api/auth/login` | POST | Login, returns JWT token |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/sync` | POST | Full data sync (upload local data) |
| `/api/auth/sync` | GET | Get all user data (download) |

**JWT Auth:**
- Use `python-jose` for JWT encoding
- Token includes `user_id` and `exp` (24h expiry)
- Middleware to validate token on protected routes

**Backward Compatibility:**
- All existing endpoints work without auth (guest mode)
- Add optional `Authorization: Bearer <token>` header
- If no token, use null user_id (existing behavior)

### 3. Frontend Changes

**New Components:**
- `LoginForm.tsx` - Email/password login
- `RegisterForm.tsx` - Create account
- `AuthGuard.tsx` - Protect routes requiring auth
- `SyncButton.tsx` - Manual sync trigger

**Modified Components:**
- `podcastStore.ts` - Add user_id to all operations
- `statsStore.ts` - Sync with backend instead of localStorage only
- `api.ts` - Add auth headers to requests

**Auth Flow:**
1. First launch: User can use app as guest (no login required)
2. On login: Fetch all user data from backend, replace local
3. On register: Auto-migrate existing guest data to new account
4. Auto-sync stats when online (debounced)
5. If offline: Store data locally, sync when back online

### 4. Sync Strategy

**What's Synced:**
- Podcasts (title, description, feed_url, image_url, author)
- Episodes (title, description, audio_url, duration, published_at, guid)
- Listening events (event_type, position, timestamp, session_id)
- Playback positions (episode_id → position_seconds)

**Guest Mode:**
- Users can use app without login
- Data stored in localStorage when not logged in
- Stats, podcasts, playback positions work offline
- "Create Account" button available anytime to convert guest to user

**Sync Mechanism:**
1. **On Login:** Fetch all user data from backend, replace local
2. **On Register:** Auto-migrate existing guest data to new account
3. **On Change (logged in):** Debounced upload (every 30s if changes)
4. **Conflict Resolution:** Server wins (last-write-wins by timestamp)
5. **Offline:** Queue changes in localStorage, sync when online

---

## Implementation Order

1. **Database:** Add User model, update Podcast model with user_id
2. **Auth API:** Register, Login, Refresh token, JWT middleware
3. **Guest Mode:** Make core endpoints work without auth
4. **Sync API:** Full data dump endpoints, auto-migration
5. **Frontend Auth:** Login/Register forms, guest mode
6. **Frontend Sync:** Connect stores to backend
7. **Offline Support:** localStorage fallback for guest mode

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Password Hashing** | bcrypt | Industry standard, secure |
| **Token Format** | JWT | Stateless, cross-platform |
| **Token Expiry** | Access: 15min, Refresh: 7 days | Secure with refresh tokens |
| **Guest Mode** | Supported | Offline podcast listening is common |
| **Data Migration** | Auto-import on account creation | Seamless for existing users |
| **Sync Direction** | Bi-directional | Upload + download |
| **Conflict Resolution** | Server wins | Simpler, consistent |
| **Offline Support** | localStorage fallback | Works when offline |

---

## Technical Stack Addition

**Backend (Python):**
- `passlib[bcrypt]` - Password hashing
- `python-jose` - JWT token handling
- `PyJWT` - JWT decode/verify

**Frontend (TypeScript):**
- No new packages needed (use existing fetch)

---

## Migration Path

**Auto-Migration on Account Creation:**
- On registration, check for any existing anonymous data
- Import: podcasts, episodes, listening events, playback positions
- Merge with any server data (server wins on conflicts)
- Clear local-only data after successful migration

**Database Migration:**
- Add user_id column as nullable initially
- After migration, make NOT NULL for new entries

---

## Files to Create/Modify

### Backend
- `app/models.py` - Add User, ListeningEvent, PlaybackPosition models
- `app/schemas.py` - Add UserCreate, UserResponse, Token schemas
- `app/auth.py` - New file: JWT utility functions
- `app/routers/auth.py` - New file: Auth endpoints
- `app/routers/podcasts.py` - Add user_id, optional auth
- `app/routers/stats.py` - New: Listening events endpoints
- `requirements.txt` - Add passlib, python-jose

### Frontend
- `src/components/LoginForm.tsx` - New
- `src/components/RegisterForm.tsx` - New
- `src/stores/authStore.ts` - New: User auth state
- `src/stores/podcastStore.ts` - Add user context
- `src/stores/statsStore.ts` - Add sync
- `src/lib/api.ts` - Add auth headers, login/logout
- `src/app/page.tsx` - Add login UI

---

*Context created: 2026-04-30*
*Ready for plan execution*