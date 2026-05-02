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
const WEEKLY_STORAGE_KEY = 'podcast_stats_weekly';
const MONTHLY_STORAGE_KEY = 'podcast_stats_monthly';
const YEARLY_STORAGE_KEY = 'podcast_stats_yearly';
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
/**
 * Load weekly stats from localStorage
 */
function loadWeeklyStats(): WeeklyStats[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WEEKLY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}
/**
 * Save weekly stats to localStorage
 */
function saveWeeklyStats(weeklyStats: WeeklyStats[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WEEKLY_STORAGE_KEY, JSON.stringify(weeklyStats));
}
/**
 * Load monthly stats from localStorage
 */
function loadMonthlyStats(): MonthlyStats[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(MONTHLY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}
/**
 * Save monthly stats to localStorage
 */
function saveMonthlyStats(monthlyStats: MonthlyStats[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(monthlyStats));
}
/**
 * Load yearly stats from localStorage
 */
function loadYearlyStats(): YearlyStats[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(YEARLY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}
/**
 * Save yearly stats to localStorage
 */
function saveYearlyStats(yearlyStats: YearlyStats[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(YEARLY_STORAGE_KEY, JSON.stringify(yearlyStats));
}
export type TimePeriod = '7days' | '30days' | 'year' | 'all';

/**
 * Weekly stats - grouped by ISO week
 */
export interface WeeklyStats {
  week: string;        // "2026-W17" (ISO week)
  total_seconds: number;
  session_count: number;
}
/**
 * Monthly stats - grouped by month
 */
export interface MonthlyStats {
  month: string;       // "2026-04"
  total_seconds: number;
  session_count: number;
}
/**
 * Yearly stats - grouped by year
 */
export interface YearlyStats {
  year: string;        // "2026"
  total_seconds: number;
  session_count: number;
}
/**
 * Time group type for UI
 */
export type TimeGroup = 'week' | 'month' | 'year';

/**
 * Get ISO week string from date
 */
function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((days + yearStart.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

/**
 * Get month string from date
 */
function getMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get year string from date
 */
function getYearString(date: Date): string {
  return date.getFullYear().toString();
}

interface PodcastStats {
  podcast_id: string;
  total_seconds: number;
  session_count: number;
}

interface EpisodeStats {
  episode_id: string;
  total_seconds: number;
  session_count: number;
}

function getStartDate(period: TimePeriod): string {
  const now = new Date();
  switch (period) {
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    case 'all':
    default:
      return '1970-01-01';
  }
}

interface StatsState {
  events: ListeningEvent[];
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  yearlyStats: YearlyStats[];
  currentSessionId: string | null;
  lastProgressTime: number;
  getTotalListeningTime: (period?: TimePeriod) => number;
  getPodcastStats: (period?: TimePeriod) => PodcastStats[];
  getEpisodeStats: (period?: TimePeriod) => EpisodeStats[];
  getWeeklyStats: (limit?: number) => WeeklyStats[];
  getMonthlyStats: (limit?: number) => MonthlyStats[];
  getYearlyStats: (limit?: number) => YearlyStats[];
  getTimeSaved: () => number;
  captureEvent: (
    event_type: ListeningEvent['event_type'],
    position: number,
    previous_position?: number,
    episode_id?: string,
    podcast_id?: string
  ) => void;
  startSession: (episode_id: string, podcast_id: string) => string;
  endSession: () => void;
  aggregateDailyStats: () => void;
  loadFromBackend: () => Promise<void>;
  getListeningTime: (podcast_id: string, startDate: string, endDate: string) => number;
  getSessionCount: (podcast_id: string, startDate: string, endDate: string) => number;
}
export const useStatsStore = create<StatsState>((set, get) => ({
  events: loadEvents(),
  dailyStats: loadDailyStats(),
  weeklyStats: loadWeeklyStats(),
  monthlyStats: loadMonthlyStats(),
  yearlyStats: loadYearlyStats(),
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
    // Read fresh events from localStorage (playerStore writes directly)
    const events = loadEvents();
    const byDateAndPodcast = new Map<string, DailyStats>();
    
    // Sort events by timestamp for time calculation
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
    
// Calculate actual listening time from play→pause intervals, accounting for seeks
    const sessionsByPodcast = new Map<string, { 
      startTime?: number; 
      startPosition?: number; 
      podcast_id: string;
      skippedForward: number;
    }>();
    
    for (const event of sortedEvents) {
      const key = `${event.session_id}_${event.podcast_id}`;
      const session = sessionsByPodcast.get(key) || { 
        podcast_id: event.podcast_id,
        startTime: undefined,
        startPosition: undefined,
        skippedForward: 0
      };
      
      if (event.event_type === 'play') {
        session.startTime = event.timestamp;
        session.startPosition = event.position_seconds;
        session.skippedForward = 0;
      } else if (event.event_type === 'seek_forward' || event.event_type === 'seek_back') {
        if (session.startPosition !== undefined && event.position_seconds > session.startPosition) {
          session.skippedForward += (event.position_seconds - session.startPosition);
        }
        session.startPosition = event.position_seconds;
      } else if ((event.event_type === 'pause' || event.event_type === 'complete') && session.startTime && session.startPosition !== undefined) {
        const contentListened = (event.position_seconds - session.startPosition) - session.skippedForward;
        if (contentListened > 0 && contentListened < 3600) {
          const date = new Date(event.timestamp).toISOString().split('T')[0];
          const dateKey = `${date}_${event.podcast_id}`;
          const existing = byDateAndPodcast.get(dateKey) || {
            date,
            podcast_id: event.podcast_id,
            total_seconds: 0,
            session_count: 0,
          };
          existing.total_seconds += contentListened;
          byDateAndPodcast.set(dateKey, existing);
        }
        session.startTime = undefined;
        session.startPosition = undefined;
        session.skippedForward = 0;
      }
      
sessionsByPodcast.set(key, session);
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

    // Also aggregate weekly/monthly/yearly stats
    const byWeek = new Map<string, WeeklyStats>();
    const byMonth = new Map<string, MonthlyStats>();
    const byYear = new Map<string, YearlyStats>();
    
    for (const stat of newDailyStats) {
      const date = new Date(stat.date);
      
      // Weekly aggregation
      const week = getISOWeek(date);
      const weeklyExisting = byWeek.get(week) || { week, total_seconds: 0, session_count: 0 };
      weeklyExisting.total_seconds += stat.total_seconds;
      weeklyExisting.session_count += stat.session_count;
      byWeek.set(week, weeklyExisting);
      
      // Monthly aggregation
      const month = getMonthString(date);
      const monthlyExisting = byMonth.get(month) || { month, total_seconds: 0, session_count: 0 };
      monthlyExisting.total_seconds += stat.total_seconds;
      monthlyExisting.session_count += stat.session_count;
      byMonth.set(month, monthlyExisting);
      
      // Yearly aggregation
      const year = getYearString(date);
      const yearlyExisting = byYear.get(year) || { year, total_seconds: 0, session_count: 0 };
      yearlyExisting.total_seconds += stat.total_seconds;
      yearlyExisting.session_count += stat.session_count;
      byYear.set(year, yearlyExisting);
    }
    
    const newWeeklyStats = Array.from(byWeek.values()).sort((a, b) => b.week.localeCompare(a.week));
    const newMonthlyStats = Array.from(byMonth.values()).sort((a, b) => b.month.localeCompare(a.month));
    const newYearlyStats = Array.from(byYear.values()).sort((a, b) => b.year.localeCompare(a.year));
    
    saveWeeklyStats(newWeeklyStats);
    saveMonthlyStats(newMonthlyStats);
    saveYearlyStats(newYearlyStats);
    
    set({ dailyStats: newDailyStats, weeklyStats: newWeeklyStats, monthlyStats: newMonthlyStats, yearlyStats: newYearlyStats, events });
  },
  loadFromBackend: async () => {
    if (typeof window === 'undefined') return;
    
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = authData?.state?.accessToken;
    if (!token) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stats/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (!res.ok) return;
      
      const backendEvents: Array<{
        id: string;
        episode_id: string;
        podcast_id: string;
        event_type: string;
        position_seconds: number;
        playback_rate: number;
        session_id: string;
        timestamp: string;
      }> = await res.json();
      
      // Get local events
      const localEvents = loadEvents();
      const localEventIds = new Set(localEvents.map(e => e.id));
      
      // Merge: add backend events that don't exist locally
      const mergedEvents = [...localEvents];
      for (const event of backendEvents) {
        if (!localEventIds.has(event.id)) {
          mergedEvents.push({
            id: event.id,
            episode_id: event.episode_id,
            podcast_id: event.podcast_id,
            event_type: event.event_type as ListeningEvent['event_type'],
            timestamp: new Date(event.timestamp).getTime(),
            position_seconds: event.position_seconds,
            playback_rate: event.playback_rate,
            session_id: event.session_id,
          });
        }
      }
      
      // Save merged events and re-aggregate
      saveEvents(mergedEvents);
      set({ events: mergedEvents });
      
      // Re-aggregate stats
      get().aggregateDailyStats();
    } catch (e) {
      console.error('Failed to load stats from backend:', e);
    }
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
  getTotalListeningTime: (period: TimePeriod = 'all') => {
    const { dailyStats } = get();
    const startDate = getStartDate(period);
    return dailyStats
      .filter((s) => s.date >= startDate)
      .reduce((acc, s) => acc + s.total_seconds, 0);
  },
  getPodcastStats: (period: TimePeriod = 'all') => {
    const { dailyStats } = get();
    const startDate = getStartDate(period);
    const filteredStats = dailyStats.filter((s) => s.date >= startDate);
    const byPodcast = new Map<string, PodcastStats>();
    for (const stat of filteredStats) {
      const existing = byPodcast.get(stat.podcast_id) || {
        podcast_id: stat.podcast_id,
        total_seconds: 0,
        session_count: 0,
      };
      existing.total_seconds += stat.total_seconds;
      existing.session_count += stat.session_count;
      byPodcast.set(stat.podcast_id, existing);
    }
    return Array.from(byPodcast.values()).sort((a, b) => b.total_seconds - a.total_seconds);
  },
  getEpisodeStats: (period: TimePeriod = 'all') => {
    const { events } = get();
    const startDate = getStartDate(period);
    const filteredEvents = events.filter((e) => {
      const eventDate = new Date(e.timestamp).toISOString().split('T')[0];
      return eventDate >= startDate;
    });
    const sortedEvents = [...filteredEvents].sort((a, b) => a.timestamp - b.timestamp);
    const byEpisode = new Map<string, EpisodeStats>();
    
    // Calculate listening time from play→pause intervals, accounting for seeks
    const sessionsByEpisode = new Map<string, { 
      startTime?: number; 
      startPosition?: number; 
      episode_id: string;
      skippedForward: number;
    }>();
    
    for (const event of sortedEvents) {
      const key = `${event.session_id}_${event.episode_id}`;
      const session = sessionsByEpisode.get(key) || { 
        episode_id: event.episode_id,
        startTime: undefined,
        startPosition: undefined,
        skippedForward: 0
      };
      
      if (event.event_type === 'play') {
        session.startTime = event.timestamp;
        session.startPosition = event.position_seconds;
        session.skippedForward = 0;
      } else if (event.event_type === 'seek_forward' || event.event_type === 'seek_back') {
        if (session.startPosition !== undefined && event.position_seconds > session.startPosition) {
          session.skippedForward += (event.position_seconds - session.startPosition);
        }
        session.startPosition = event.position_seconds;
      } else if ((event.event_type === 'pause' || event.event_type === 'complete') && session.startTime && session.startPosition !== undefined) {
        const contentListened = (event.position_seconds - session.startPosition) - session.skippedForward;
        if (contentListened > 0 && contentListened < 3600) {
          const existing = byEpisode.get(event.episode_id) || {
            episode_id: event.episode_id,
            total_seconds: 0,
            session_count: 0,
          };
          existing.total_seconds += contentListened;
          byEpisode.set(event.episode_id, existing);
        }
        session.startTime = undefined;
        session.startPosition = undefined;
        session.skippedForward = 0;
      }
      
      sessionsByEpisode.set(key, session);
    }
    
    for (const event of filteredEvents) {
      if (event.event_type === 'play' || event.event_type === 'complete') {
        const existing = byEpisode.get(event.episode_id);
        if (existing) {
          existing.session_count += 1;
        }
      }
    }
    return Array.from(byEpisode.values()).sort((a, b) => b.total_seconds - a.total_seconds);
  },
  getWeeklyStats: (limit: number = 12) => {
    const { weeklyStats } = get();
    return weeklyStats.slice(0, limit);
  },
  getMonthlyStats: (limit: number = 12) => {
    const { monthlyStats } = get();
    return monthlyStats.slice(0, limit);
  },
  getYearlyStats: (limit: number = 5) => {
    const { yearlyStats } = get();
    return yearlyStats.slice(0, limit);
  },
getTimeSaved: () => {
    const { events } = get();
    let timeSaved = 0;
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
    
    // Track sessions to calculate time saved per session
    const sessions = new Map<string, { 
      startPosition?: number; 
      playbackRate: number; 
      skippedForward: number;
    }>();
    
    for (const event of sortedEvents) {
      const key = `${event.session_id}_${event.podcast_id}`;
      const session = sessions.get(key) || { 
        startPosition: undefined, 
        playbackRate: 1,
        skippedForward: 0
      };
      
      if (event.event_type === 'play') {
        session.startPosition = event.position_seconds;
        session.playbackRate = event.playback_rate || 1;
        session.skippedForward = 0;
      } else if (event.event_type === 'seek_forward' || event.event_type === 'seek_back') {
        if (session.startPosition !== undefined && event.position_seconds > session.startPosition) {
          session.skippedForward += (event.position_seconds - session.startPosition);
        }
        session.startPosition = event.position_seconds;
      } else if ((event.event_type === 'pause' || event.event_type === 'complete') && session.startPosition !== undefined) {
        // Calculate content listened and time saved
        const contentListened = (event.position_seconds - session.startPosition) - session.skippedForward;
        if (contentListened > 0 && session.playbackRate > 1) {
          const wallClockTime = contentListened / session.playbackRate;
          timeSaved += (contentListened - wallClockTime);
        }
        session.startPosition = undefined;
      }
      
      sessions.set(key, session);
    }
    
    return Math.round(timeSaved);
  },
}));