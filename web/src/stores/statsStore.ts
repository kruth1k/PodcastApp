import { create } from 'zustand';
/**
 * ListeningEvent data model - captures all playback interactions
 * for accurate statistics calculation
 */
export interface ListeningEvent {
  id: string;                    // UUID
  episode_id: string;
  podcast_id: string;
  event_type: 'play' | 'pause' | 'seek_forward' | 'seek_back' | 'complete' | 'progress';
  timestamp: number;            // Unix timestamp (ms)
  position_seconds: number;    // Current position when event occurred
  previous_position?: number;  // For seek events (where they came from)
  playback_rate: number;      // Speed at time of event
  session_id: string;           // Groups events from same play session
}
/**
 * Pre-aggregated daily stats for fast queries
 */
export interface DailyStats {
  date: string;              // YYYY-MM-DD
  podcast_id: string;
  total_seconds: number;     // Total listening time for this day/podcast
  session_count: number;     // Number of sessions
}
/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
/**
 * Storage keys for localStorage persistence
 */
const EVENTS_STORAGE_KEY = 'podcast_stats_events';
const DAILY_STORAGE_KEY = 'podcast_stats_daily';
const PROGRESS_MIN_INTERVAL = 25000; // Minimum 25s between progress captures (D-40)
/**
 * Load events from localStorage
 */
function loadEvents(): ListeningEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}
/**
 * Save events to localStorage
 */
function saveEvents(events: ListeningEvent[]): void {
  if (typeof window === 'undefined') return;
  // Limit stored events to last 10,000 to prevent localStorage bloat
  const trimmed = events.slice(-10000);
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(trimmed));
}
/**
 * Load daily stats from localStorage
 */
function loadDailyStats(): DailyStats[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DAILY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}
/**
 * Save daily stats to localStorage
 */
function saveDailyStats(dailyStats: DailyStats[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dailyStats));
}
interface StatsState {
  events: ListeningEvent[];
  dailyStats: DailyStats[];
  currentSessionId: string | null;
  lastProgressTime: number; // For deduplication
  /**   * Capture a playback event
   */
  captureEvent: (
    event_type: ListeningEvent['event_type'],
    position: number,
    previous_position?: number,
    episode_id?: string,
    podcast_id?: string
  ) => void;
  /**
   * Start a new listening session (called on play)
   */
  startSession: (episode_id: string, podcast_id: string) => string;
  /**
   * End the current session
   */
  endSession: () => void;
  /**
   * Aggregate events into daily stats
   */
  aggregateDailyStats: () => void;
  /**
   * Get total listening time for a podcast within a date range
   */
  getListeningTime: (podcast_id: string, startDate: string, endDate: string) => number;
  /**
   * Get session count for a podcast within a date range
   */
  getSessionCount: (podcast_id: string, startDate: string, endDate: string) => number;
}
export const useStatsStore = create<StatsState>((set, get) => ({
  events: loadEvents(),
  dailyStats: loadDailyStats(),
  currentSessionId: null,
  lastProgressTime: 0,
  captureEvent: (
    event_type: ListeningEvent['event_type'],
    position: number,
    previous_position?: number,
    episode_id?: string,
    podcast_id?: string
  ) => {
    const { events, currentSessionId, lastProgressTime, aggregateDailyStats: aggregate } = get();
    // Skip duplicate progress events within 25 seconds (D-40: Event deduplication)
    if (event_type === 'progress') {
      const now = Date.now();
      if (now - lastProgressTime < PROGRESS_MIN_INTERVAL) {
        return;
      }
    }
    // Need an active session for event capture
    if (!currentSessionId) {
      return;
    }
    // Get playback rate from player store (imported at runtime to avoid circular deps)
    let playback_rate = 1;
    let episodeId = episode_id || '';
    let podcastId = podcast_id || '';
    // Try to get from player store if not provided
    if (typeof window !== 'undefined') {
      try {
        // @ts-ignore - dynamic import to avoid circular dependency
        const playerStore = require('@/stores/playerStore').usePlayerStore.getState?.();
        if (playerStore) {
          playback_rate = playerStore.playbackRate || 1;
          if (!episodeId && playerStore.currentEpisode) {
            episodeId = playerStore.currentEpisode.id || '';
            podcastId = playerStore.currentEpisode.podcast_id || '';
          }
        }
      } catch {
        // Fallback to defaults
      }
    }
    const now = Date.now();
    const event: ListeningEvent = {
      id: generateUUID(),
      episode_id: episodeId,
      podcast_id: podcastId,
      event_type,
      timestamp: now,
      position_seconds: position,
      previous_position: previous_position,
      playback_rate,
      session_id: currentSessionId,
    };
    const newEvents = [...events, event];
    saveEvents(newEvents);
    set({
      events: newEvents,
      lastProgressTime: event_type === 'progress' ? now : lastProgressTime,
    });
    // Re-aggregate daily stats on each event
    aggregate();
  },
  startSession: (episode_id: string, podcast_id: string) => {
    const sessionId = generateUUID();
    set({
      currentSessionId: sessionId,
      lastProgressTime: Date.now(),
    });
    return sessionId;
  },
  endSession: () => {
    set({ currentSessionId: null });
  },
  aggregateDailyStats: () => {
    const { events } = get();
    const byDateAndPodcast = new Map<string, DailyStats>();
    for (const event of events) {
      // Only count progress events as actual listening time
      if (event.event_type !== 'progress') continue;
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      const key = `${date}_${event.podcast_id}`;
      const existing = byDateAndPodcast.get(key) || {
        date,
        podcast_id: event.podcast_id,
        total_seconds: 0,
        session_count: 0,
      };
      // Each progress event represents ~30 seconds of listening
      existing.total_seconds += 30;
      byDateAndPodcast.set(key, existing);
    }
    // Count unique sessions
    const sessionsByDateAndPodcast = new Map<string, Set<string>>();
    for (const event of events) {
      if (event.event_type !== 'play') continue;
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      const key = `${date}_${event.podcast_id}`;
      if (!sessionsByDateAndPodcast.has(key)) {
        sessionsByDateAndPodcast.set(key, new Set());
      }
      sessionsByDateAndPodcast.get(key)!.add(event.session_id);
    }
    // Apply session counts to aggregated stats
    for (const [key, sessions] of sessionsByDateAndPodcast) {
      const stats = byDateAndPodcast.get(key);
      if (stats) {
        stats.session_count = sessions.size;
      }
    }
    const newDailyStats = Array.from(byDateAndPodcast.values());
    saveDailyStats(newDailyStats);
    set({ dailyStats: newDailyStats });
  },
  getListeningTime: (podcast_id: string, startDate: string, endDate: string) => {
    const { dailyStats } = get();
    return dailyStats
      .filter(
        (s) =>
          s.podcast_id === podcast_id &&
          s.date >= startDate &&
          s.date <= endDate
      )
      .reduce((acc, s) => acc + s.total_seconds, 0);
  },
  getSessionCount: (podcast_id: string, startDate: string, endDate: string) => {
    const { dailyStats } = get();
    return dailyStats
      .filter(
        (s) =>
          s.podcast_id === podcast_id &&
          s.date >= startDate &&
          s.date <= endDate
      )
      .reduce((acc, s) => acc + s.session_count, 0);
  },
}));