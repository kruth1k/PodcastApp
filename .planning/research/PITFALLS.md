# Domain Pitfalls: Podcast App with Statistics Focus

**Project:** PodcastStats  
**Domain:** Podcast Player with Statistics Tracking  
**Researched:** 2026-04-29  
**Overall Confidence:** MEDIUM-HIGH

This document identifies critical, moderate, and minor pitfalls specific to building a podcast player where statistics tracking is the core value proposition. Each pitfall includes warning signs, prevention strategies, and phase mapping.

---

## Critical Pitfalls

Mistakes that cause data loss, complete rewrites, or fundamentally broken statistics.

### Pitfall 1: Incorrect Listening Time Tracking (Inflated or Negative Values)

**What goes wrong:** Statistics show impossible values—users "listening" 150+ hours in a single day, or negative listening times. The core value proposition becomes meaningless.

**Why it happens:** 
- Sessions not properly closed when app is backgrounded or killed
- Server disconnection mid-playback not detected, causing massive time increments on reconnection
- Mobile apps sending incorrect duration data to the backend
- Time sync issues between client and server

**Consequences:** 
- Statistics become unreliable and untrustworthy
- Users lose faith in the entire app
- Impossible to identify actual listening patterns

**Prevention:**
1. **Implement session-based tracking with heartbeat**: Record session start time, and send periodic heartbeats (every 30-60 seconds) while playback is active. Calculate duration on the server, not the client.
2. **Validate listening sessions before storage**: Reject any session where duration > 24 hours or duration is negative. Flag for review.
3. **Detect client/server disconnection**: If network drops mid-playback, pause time accumulation until reconnection verified.
4. **Force session closure on app background**: Save current playback position and session state immediately when app moves to background.

**Detection:**
- Add dashboard alerts for anomalous statistics (sessions > 12 hours, negative values)
- Log session data to identify patterns in bad data

**Phase:** Core Playback (Phase 2) + Statistics Infrastructure (Phase 3)

---

### Pitfall 2: Statistics Shift Between Time Periods (Month-to-Month Inconsistency)

**What goes wrong:** Users notice their "hours listened" for previous months decrease as new months begin. Total hours remain correct, but distribution across months is wrong.

**Why it happens:** 
- Statistics stored with single `last_played_time` field per episode
- Re-playing an episode updates `last_played_time`, moving ALL its played duration to the new month
- No granular tracking of when each playback session occurred

**Consequences:**
- Monthly/weekly statistics appear unstable and unreliable
- Users cannot trust historical listening data
- The core differentiation (detailed time-based analytics) fails

**Prevention:**
1. **Store per-session data, not aggregate**: Instead of one `played_duration` and `last_played_time` per episode, store individual playback sessions with start time and duration.
2. **Design database schema for time-series statistics**: Use a separate table for listening sessions that can be aggregated flexibly (by day, week, month, year) at query time.
3. **Accept storage trade-off**: Plan for more database storage. AntennaPod explicitly chose against this approach due to storage concerns—but for a stats-focused app, accuracy is worth the cost.

**Detection:**
- Compare monthly totals against annual totals—if monthly distribution changes over time, there's a problem
- Alert when same episode is played across month boundaries

**Phase:** Database Design (Phase 1) + Statistics Infrastructure (Phase 3)

---

### Pitfall 3: Database Corruption Causing Complete Data Loss

**What goes wrong:** Users open the app and all podcasts, episodes, and listening history are gone. Downloaded files may still exist but are orphaned from the app.

**Why it happens:** 
- SQLite database corruption (common on mobile, especially with external storage)
- App crashes during database writes (especially during background refresh)
- No regular backups or migration paths for database schema changes
- No transaction handling for multi-step operations

**Consequences:**
- Complete loss of listening history and statistics
- Users lose all progress and data
- Devastating for an app built around personal statistics

**Prevention:**
1. **Implement regular automated backups**: Backup database to local storage daily, keep last 7 backups. Provide export/import functionality.
2. **Use WAL (Write-Ahead Logging) mode**: SQLite's WAL mode provides better crash recovery and prevents database locking issues.
3. **Wrap multi-step operations in transactions**: Ensure atomicity for operations that modify multiple tables.
4. **Add database integrity checks**: Run `PRAGMA integrity_check` on app startup and repair/backup before major operations.
5. **Create CorruptedDatabaseBackup before reset**: If corruption is detected, save the corrupted file for potential recovery.

**Detection:**
- Detect corruption on startup before attempting operations
- Log database errors with full context for debugging

**Phase:** Database Design (Phase 1) + Data Persistence (Phase 2)

---

### Pitfall 4: Background Playback Being Killed by OS Battery Optimization

**What goes wrong:** Podcast stops playing when phone screen locks or app goes to background. Users experience interrupted playback and broken statistics (time stops being recorded).

**Why it happens:** 
- Android/iOS aggressive battery optimization targeting background apps
- Media service not properly configured as foreground service
- Missing background audio capabilities in app manifest
- Wake locks not properly managed

**Consequences:**
- Incomplete listening sessions (statistics truncated)
- Poor user experience—podcasts stop unexpectedly
- Users may think the app is broken

**Prevention:**
1. **Configure proper foreground service**: Use Media3/MediaSessionService with foreground notification. Ensure audio playback continues when app is backgrounded.
2. **Request battery optimization exemption**: On first launch, guide users to disable battery optimization for your app (with clear explanation of why).
3. **Implement proper audio focus**: Handle audio focus changes (phone calls, other apps) gracefully.
4. **Test on multiple devices**: Battery optimization behavior varies significantly across manufacturers (Samsung, Huawei, OnePlus have different quirks).
5. **Use ExoPlayer's wake lock appropriately**: Configure wake mode based on streaming vs. downloaded content. Enable audio offload to low-power DSP when possible.

**Detection:**
- Track playback interruptions not caused by user action
- Compare expected session duration vs. recorded duration
- Monitor for "playback stopped unexpectedly" patterns

**Phase:** Core Playback (Phase 2)

---

## Moderate Pitfalls

Mistakes that cause significant issues but can be recovered with workarounds or fixes.

### Pitfall 5: Memory Crashes During Feed Refresh (OOM)

**What goes wrong:** App becomes unresponsive, crashes, or loses data during background feed refresh. Users with large libraries (100+ subscriptions) are most affected.

**Why it happens:** 
- Loading entire feed history instead of just new episodes
- Downloading and caching large audio files during refresh
- Not implementing pagination for large feeds
- Memory leaks in image/artwork loading

**Consequences:**
- App crashes during routine operations
- Data loss if crash occurs during database write
- Users with large libraries cannot use the app

**Prevention:**
1. **Implement incremental refresh**: Only fetch episodes from the last 30 days by default, with option to load older episodes on demand.
2. **Limit image caching**: Use memory-efficient image loading (Coil, Glide) with aggressive memory management. Don't load full-resolution artwork.
3. **Paginate feed parsing**: Process feed in chunks, not all at once.
4. **Schedule refresh strategically**: Don't refresh on app launch—use WorkManager with constraints (wifi only, not low battery).
5. **Monitor memory usage**: Implement memory pressure detection and reduce background work when memory is low.

**Detection:**
- Track OOM crash rates by library size
- Monitor average episodes per subscription
- Log refresh times and memory usage

**Phase:** Feed Management (Phase 2) + Performance Optimization (Phase 4)

---

### Pitfall 6: RSS Feed Parsing Incompatibility

**What goes wrong:** Some podcasts don't load, show incorrect episodes, or have missing metadata. Different feeds use different standards and extensions.

**Why it happens:** 
- Feeds don't follow RSS 2.0 specification exactly
- iTunes namespace tags missing or malformed
- Custom namespace extensions not handled
- Encoding issues (special characters, non-UTF8)
- Feed includes episodes but removes old ones (feed drift)

**Consequences:**
- Users cannot subscribe to certain podcasts
- Missing or incorrect episode information
- Incomplete statistics for affected podcasts

**Prevention:**
1. **Use robust feed parser library**: Don't write your own—use established libraries (Rome, AndroidRss, or platform-specific equivalents).
2. **Validate against Apple Podcasts requirements**: Apple has strict standards—use their validation tool during development.
3. **Handle missing optional fields gracefully**: Provide defaults for missing artwork, descriptions, etc.
4. **Detect feed changes**: Track GUIDs to identify removed episodes vs. new episodes.
5. **Implement feed recovery**: If a feed fails, try re-fetching with different parsers or configurations.

**Detection:**
- Track feed fetch success rates
- Log parsing failures with feed URL (for later analysis)
- Allow users to report broken feeds

**Phase:** Feed Management (Phase 2)

---

### Pitfall 7: Playback Position Lost on Resume

**What goes wrong:** User pauses podcast, later resumes, and playback starts from wrong position (usually earlier). User loses progress and statistics are inaccurate.

**Why it happens:** 
- Position not saved immediately on pause
- Resume uses cached position before fresh position loaded
- Background playback killed, position not persisted
- Seek operations failing silently
- Dynamic Ad Insertion (DAI) causing position mismatch

**Consequences:**
- User loses listening progress
- Statistics record time from wrong position
- Frustrating user experience
- Potentially re-listening to content already completed

**Prevention:**
1. **Save position on every pause**: Immediately persist position to database, not just in memory.
2. **Verify position on resume**: Fetch current position from player, not just use cached value.
3. **Handle seek failures**: Implement retry logic for seek operations.
4. **Account for DAI**: If podcast uses dynamic ads, be aware that declared duration may differ from actual duration.
5. **Use reliable position tracking**: Don't rely solely on player position—maintain your own tracking based on time played.

**Detection:**
- Track position differences between "last played position" and actual resume position
- Monitor for re-listening to already-completed episodes

**Phase:** Core Playback (Phase 2)

---

### Pitfall 8: Dynamic Ad Insertion Causing Playback Glitches

**What goes wrong:** Playback randomly jumps backward 30-90 seconds or forward. User loses place in podcast. More common with monetized podcasts using server-side ad insertion.

**Why it happens:** 
- Audio duration in feed doesn't match actual audio (ads added dynamically)
- Player requests byte ranges based on declared duration that don't align with actual audio
- Ad server responses vary between requests
- Player doesn't handle redirect chains correctly for dynamic content

**Consequences:**
- Playback position jumping, losing user place
- Inaccurate progress tracking
- Annoying user experience

**Prevention:**
1. **Cache initial audio data**: When streaming, cache first 30-50MB to handle position changes more reliably.
2. **Handle variable duration**: Don't trust feed-declared duration. Detect actual duration after loading.
3. **Use robust streaming library**: Media3/ExoPlayer handles more edge cases than custom implementations.
4. **Implement position verification**: Periodically verify current position against expected.

**Note:** This is largely out of your control as an app developer—you're at the mercy of podcast host implementations. Focus on graceful handling rather than prevention.

**Detection:**
- Track playback position "jumps" (sudden changes not caused by user seeking)
- Correlate with known DAI podcast networks

**Phase:** Core Playback (Phase 2)

---

## Minor Pitfalls

Issues that cause limited impact or have straightforward workarounds.

### Pitfall 9: Cross-Device Statistics Not Synchronized

**What goes wrong:** User has app on phone and desktop, but listening statistics are separate. They can't see their total listening time across devices.

**Why it happens:** 
- No backend server to sync data
- Local-first architecture doesn't support sync
- Sync conflicts not handled properly

**Consequences:** 
- Incomplete statistics view
- User has to check multiple places
- Less valuable for stats-focused app

**Prevention:**
1. **Design for sync from start**: Even if not implementing sync in MVP, design database schema to support it.
2. **Use user accounts early**: Allow optional login to enable future sync.
3. **Handle offline-first sync**: When implementing sync, handle offline periods gracefully.

**Phase:** Database Design (Phase 1) → Sync Feature (Future Phase)

---

### Pitfall 10: Battery Drain During Background Playback

**What goes wrong:** App shows extremely high battery usage (20-60% of total battery). Users notice other apps draining faster.

**Why it happens:** 
- Inefficient audio decoding (CPU instead of DSP)
- Excessive wake locks
- Running background processes unnecessarily
- Audio effects (trim silence, volume boost) using CPU

**Consequences:**
- User uninstalls due to battery concerns
- Statistics incomplete if app killed due to battery

**Prevention:**
1. **Enable audio offload**: Use Media3's audio offload preferences when no effects are active.
2. **Configure appropriate wake locks**: Use `WAKE_MODE_LOCAL` for downloaded content, `WAKE_MODE_NETWORK` for streaming.
3. **Set proper audio attributes**: Use `AudioAttributes` for speech content to help system optimize.
4. **Profile battery usage**: Test with battery profiling tools. Monitor in various states (screen on/off, wifi/cellular).

**Phase:** Core Playback (Phase 2) + Performance Optimization (Phase 4)

---

### Pitfall 11: Storage Space Exhaustion

**What goes wrong:** User runs out of space on device. App can't download new episodes. Database operations fail.

**Why it happens:** 
- No limit on downloaded episodes
- Not tracking total storage used
- No cleanup of old episodes automatically
- Database growing without bounds (detailed statistics = more data)

**Consequences:**
- App unusable
- Statistics lost due to database issues
- Poor user experience

**Prevention:**
1. **Implement storage management UI**: Show total storage used, allow users to set limits.
2. **Auto-cleanup policies**: Delete played episodes after X days, keep last N episodes per podcast.
3. **Warn before downloads**: Check available space before large downloads.
4. **Compress statistics data**: Use appropriate data types, don't store more detail than needed.

**Phase:** Library Management (Phase 2) + Storage Management (Phase 3)

---

## Phase-Specific Warning Summary

| Phase | Primary Pitfalls to Address | Priority |
|-------|----------------------------|----------|
| **Phase 1: Foundation** | Database corruption, statistics data model (Pitfall 2, 3) | Critical |
| **Phase 2: Core Playback** | Background playback killed, position lost, memory crashes (Pitfall 4, 7, 5) | Critical |
| **Phase 3: Statistics** | Incorrect time tracking, time-period shifts (Pitfall 1, 2) | Critical |
| **Phase 4: Polish** | Battery drain, storage management (Pitfall 10, 11) | Moderate |

---

## Sources

- AntennaPod issue discussions on statistics accuracy (GitHub issues #6080, #3918)
- AntennaPod OOM crash investigation (#7664)
- Audiobookshelf listening time bugs (#2548, #4481)
- Pocket Casts playback troubleshooting documentation
- Android Media3/ExoPlayer battery optimization patterns
- Podcast app development guides (Miquido, SoloDevStack, Idiosys Tech)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Statistics tracking pitfalls | HIGH | Multiple real-world bug reports from AntennaPod and Audiobookshelf |
| Playback reliability | MEDIUM-HIGH | Common mobile audio issues, well-documented patterns |
| Feed handling | MEDIUM | Standard RSS challenges, depends on specific implementation |
| Battery/performance | MEDIUM | Device-specific variations make some issues hard to predict |
| Database design | HIGH | Clear patterns from existing podcast apps |

**Overall Confidence:** MEDIUM-HIGH

The core pitfalls around statistics tracking and playback reliability are well-supported by real-world bug reports from established podcast apps. Some battery optimization issues are device-specific and may require user testing to fully characterize.