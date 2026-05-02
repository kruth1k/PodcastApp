import { create } from 'zustand';
import { Howl } from 'howler';

const NGROK_SKIP_HEADER = { 'ngrok-skip-browser-warning': 'true' };

export interface Episode {
  id: string;
  podcast_id?: string;
  title: string;
  description: string;
  audio_url: string;
  duration: number | null;
  published_at: string;
  guid: string;
}

const getStoredPosition = (episodeId: string): number | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`podcast_position_${episodeId}`);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      return typeof data.position === 'number' ? data.position : null;
    } catch {
      return null;
    }
  }
  return null;
};

const CURRENT_EPISODE_KEY = 'podcast_current_episode';

const getStoredCurrentEpisode = (): Episode | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CURRENT_EPISODE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

const saveCurrentEpisode = (episode: Episode | null): void => {
  if (typeof window === 'undefined') return;
  if (episode) {
    localStorage.setItem(CURRENT_EPISODE_KEY, JSON.stringify(episode));
  } else {
    localStorage.removeItem(CURRENT_EPISODE_KEY);
  }
};

const savePosition = (episodeId: string, position: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`podcast_position_${episodeId}`, JSON.stringify({
    position,
    updatedAt: Date.now()
  }));
  
  // Also save to backend for cross-device sync
  const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const token = authData?.state?.accessToken;
  if (token) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stats/position/${episodeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...NGROK_SKIP_HEADER
      },
      body: JSON.stringify({ episode_id: episodeId, position_seconds: Math.floor(position) })
    }).catch(console.error);
  }
};

/** Generate a UUID v4 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface PlayerState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  playbackRate: number;
  volume: number;
  howlInstance: Howl | null;
  seekTimeout: NodeJS.Timeout | null;
  playedEpisodes: Set<string>;
  // Session tracking (D-38)
  currentSessionId: string | null;
  lastProgressTime: number;
  progressInterval: NodeJS.Timeout | null;
  pauseTimestamp: number | null;

  playEpisode: (episode: Episode) => void;
  togglePlay: () => void;
  seek: (position: number) => void;
  setPlaybackRate: (rate: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  updatePosition: () => void;
  loadPosition: (episodeId: string) => number | null;
  setLastPlayed: (episode: Episode, position: number) => void;
  isPlayed: (episodeId: string) => boolean;
  togglePlayed: (episodeId: string) => void;
  markEpisodePlayed: (episodeId: string) => void;
  endSession: () => void;
  clearPlayer: () => void;

  // Event capture (D-36, D-40)
  captureEvent: (event_type: 'play' | 'pause' | 'seek_forward' | 'seek_back' | 'complete' | 'progress', position: number, previous_position?: number) => void;
  startProgressHeartbeat: () => void;
  stopProgressHeartbeat: () => void;
}

/** Start the 10-second progress heartbeat */
function startProgressHeartbeat(state: PlayerState): void {
  if (state.progressInterval) {
    clearInterval(state.progressInterval);
  }
  
  const interval = setInterval(() => {
    const current = usePlayerStore.getState();
    if (current.isPlaying && current.howlInstance) {
      const pos = current.howlInstance.seek();
      if (typeof pos === 'number') {
        current.captureEvent('progress', pos);
      }
    }
  }, 10000);

  state.progressInterval = interval;
}

/** Stop the progress heartbeat */
function stopProgressHeartbeat(state: PlayerState): void {
  if (state.progressInterval) {
    clearInterval(state.progressInterval);
    state.progressInterval = null;
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentEpisode: typeof window !== 'undefined' ? getStoredCurrentEpisode() : null,
  position: (() => {
    const ep = typeof window !== 'undefined' ? getStoredCurrentEpisode() : null;
    return ep ? getStoredPosition(ep.id) || 0 : 0;
  })(),
  isPlaying: false,
  isBuffering: false,
  duration: 0,
  playbackRate: 1,
  volume: 1,
  howlInstance: null,
  seekTimeout: null,
  playedEpisodes: new Set<string>(),
  currentSessionId: null,
  lastProgressTime: 0,
  progressInterval: null,
  pauseTimestamp: null,

  loadPosition: (episodeId: string) => getStoredPosition(episodeId),

  setLastPlayed: (episode: Episode, position: number) => {
    set({
      currentEpisode: episode,
      position: position,
      isPlaying: false,
      isBuffering: false,
      duration: 0,
      howlInstance: null,
    });
  },

  isPlayed: (episodeId: string): boolean => {
    const { playedEpisodes } = get();
    if (playedEpisodes.has(episodeId)) return true;
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`podcast_played_${episodeId}`) === 'true';
  },

  togglePlayed: (episodeId: string): void => {
    if (typeof window === 'undefined') return;
    const { playedEpisodes } = get();
    const newSet = new Set(playedEpisodes);
    if (localStorage.getItem(`podcast_played_${episodeId}`) === 'true') {
      localStorage.removeItem(`podcast_played_${episodeId}`);
      newSet.delete(episodeId);
    } else {
      localStorage.setItem(`podcast_played_${episodeId}`, 'true');
      newSet.add(episodeId);
    }
    set({ playedEpisodes: newSet });
  },

  markEpisodePlayed: (episodeId: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`podcast_played_${episodeId}`, 'true');
    const { playedEpisodes } = get();
    const newSet = new Set(playedEpisodes);
    newSet.add(episodeId);
    set({ playedEpisodes: newSet });
  },

  /** Capture a listening event (D-36, D-37) */
  captureEvent: (event_type, position, previous_position) => {
    const { currentSessionId, lastProgressTime, currentEpisode } = get();
    const now = Date.now();
    
    // Skip duplicate progress events within 25 seconds (D-40: deduplication)
    if (event_type === 'progress' && now - lastProgressTime < 25000) {
      return;
    }
    
    if (!currentSessionId || !currentEpisode) {
      return;
    }
    
    try {
      const events = JSON.parse(localStorage.getItem('podcast_stats_events') || '[]');
      const event = {
        id: generateUUID(),
        episode_id: currentEpisode.id,
        podcast_id: currentEpisode.podcast_id || '',
        event_type,
        timestamp: now,
        position_seconds: position,
        previous_position: previous_position,
        playback_rate: get().playbackRate,
        session_id: currentSessionId,
      };
      events.push(event);
      // Limit to last 10,000 to prevent localStorage bloat
      localStorage.setItem('podcast_stats_events', JSON.stringify(events.slice(-10000)));
      
      // Send to backend for cross-device sync
      const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const token = authData?.state?.accessToken;
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stats/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...NGROK_SKIP_HEADER
          },
          body: JSON.stringify({
            episode_id: currentEpisode.id,
            podcast_id: currentEpisode.podcast_id || '',
            event_type,
            position_seconds: Math.floor(position),
            playback_rate: get().playbackRate,
            session_id: currentSessionId,
          })
        }).catch(console.error);
      }
      
      // Trigger daily stats aggregation
      try {
        const statsStore = require('@/stores/statsStore').useStatsStore.getState();
        if (statsStore?.aggregateDailyStats) {
          statsStore.aggregateDailyStats();
        }
      } catch {
        // Ignore stats store errors
      }
    } catch {
      // Ignore storage errors
    }
    
    set({ lastProgressTime: event_type === 'progress' ? now : lastProgressTime });
  },

  startProgressHeartbeat: () => startProgressHeartbeat(get()),
  stopProgressHeartbeat: () => stopProgressHeartbeat(get()),
  endSession: () => set({ currentSessionId: null, pauseTimestamp: null }),
  
  clearPlayer: () => {
    const { howlInstance, seekTimeout, progressInterval } = get();
    if (howlInstance) howlInstance.unload();
    if (seekTimeout) clearTimeout(seekTimeout);
    if (progressInterval) clearInterval(progressInterval);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('podcast_current_episode');
    }
    
    set({
      currentEpisode: null,
      isPlaying: false,
      isBuffering: false,
      position: 0,
      duration: 0,
      howlInstance: null,
      seekTimeout: null,
      progressInterval: null,
      currentSessionId: null,
    });
  },

  playEpisode: (episode: Episode) => {
    const state = get();
    const { howlInstance, seekTimeout, currentEpisode, currentSessionId } = state;
    
    if (currentSessionId) {
      state.captureEvent('complete', state.position);
      state.stopProgressHeartbeat();
    }
    
    if (currentEpisode) {
      savePosition(currentEpisode.id, state.position);
    }
    
    saveCurrentEpisode(episode);
    
    if (howlInstance) howlInstance.unload();
    if (seekTimeout) clearTimeout(seekTimeout);

    const savedPosition = getStoredPosition(episode.id);
    const newSessionId = generateUUID();

    set({ isBuffering: true });

    const howl = new Howl({
      src: [episode.audio_url],
      html5: true,
      preload: true,
      rate: state.playbackRate,
      volume: state.volume,
      onload: () => {
        set({ duration: howl.duration(), isBuffering: false });
        if (savedPosition !== null && savedPosition > 0) howl.seek(savedPosition);
      },
      onplay: () => {
        set({ isPlaying: true, isBuffering: false });
        get().updatePosition();
      },
      onpause: () => {
        const { currentEpisode, position } = get();
        if (currentEpisode) savePosition(currentEpisode.id, position);
        set({ isPlaying: false, pauseTimestamp: Date.now() });
        get().captureEvent('pause', position);
      },
      onend: () => {
        const { currentEpisode } = get();
        if (currentEpisode) {
          localStorage.setItem(`podcast_played_${currentEpisode.id}`, 'true');
          savePosition(currentEpisode.id, 0); // Reset position to 0 on completion
          saveCurrentEpisode(null); // Clear saved episode on completion
        }
        get().captureEvent('complete', get().position);
        set({ isPlaying: false, position: 0, isBuffering: false });
        state.stopProgressHeartbeat();
        state.endSession();
      },
      onloaderror: () => {
        set({ isBuffering: false });
      },
    });

    set({
      currentEpisode: episode,
      howlInstance: howl,
      isPlaying: true,
      position: savedPosition || 0,
      seekTimeout: null,
      currentSessionId: newSessionId,
      pauseTimestamp: null,
    });
    
    howl.play();
    
    get().captureEvent('play', savedPosition || 0);
    get().startProgressHeartbeat();
  },

  togglePlay: () => {
    const state = get();
    const { howlInstance, isPlaying, currentEpisode, position, currentSessionId, pauseTimestamp } = state;
    
    // Handle desync: if isPlaying is true but no howlInstance, audio might be orphaned from navigation
    // Reset to a clean state
    if (isPlaying && !howlInstance) {
      set({ isPlaying: false, position: 0 });
      return;
    }
    
    // Handle opposite desync: isPlaying is false but howlInstance is actually playing
    // This can happen after navigation - audio keeps playing but state gets out of sync
    if (!isPlaying && howlInstance && howlInstance.playing()) {
      set({ isPlaying: true });
      return;
    }
    
    // If no audio instance but episode exists, start playing
    if (!howlInstance && currentEpisode) {
      get().playEpisode(currentEpisode);
      return;
    }
    
    if (!howlInstance) return;

    if (isPlaying) {
      if (currentEpisode) savePosition(currentEpisode.id, position);
      howlInstance.pause();
    } else {
      howlInstance.play();
      set({ pauseTimestamp: null });
      
      // Emit 'play' event if resuming after pause
      if (!currentSessionId) {
        const newSessionId = generateUUID();
        set({ currentSessionId: newSessionId });
        get().captureEvent('play', position);
        get().startProgressHeartbeat();
      } else {
        get().captureEvent('play', position);
      }
      
      // Pause > 30 seconds ends session (D-38)
      const now = Date.now();
      if (pauseTimestamp && now - pauseTimestamp > 30000 && currentSessionId) {
        state.stopProgressHeartbeat();
        set({ currentSessionId: null });
      }
    }
  },

  seek: (position: number) => {
    const state = get();
    const { howlInstance, seekTimeout, currentEpisode, position: currentPos } = state;
    if (!howlInstance) return;

    if (seekTimeout) clearTimeout(seekTimeout);
    
    const event_type = position > currentPos ? 'seek_forward' : 'seek_back';
    state.captureEvent(event_type, position, currentPos);
    
    const timeout = setTimeout(() => {
      if (howlInstance) {
        howlInstance.seek(position);
        set({ position, seekTimeout: null });
        if (currentEpisode) savePosition(currentEpisode.id, position);
      }
    }, 50);

    set({ position, seekTimeout: timeout });
  },

  setPlaybackRate: (rate: number) => {
    const { howlInstance } = get();
    if (howlInstance) howlInstance.rate(rate);
    set({ playbackRate: rate });
  },

  skipForward: () => {
    const state = get();
    const { howlInstance, position, duration, seekTimeout, currentEpisode, position: currentPos } = state;
    if (!howlInstance) return;
    if (seekTimeout) clearTimeout(seekTimeout);
    const newPosition = Math.min(position + 15, duration);
    state.captureEvent('seek_forward', newPosition, currentPos);
    howlInstance.seek(newPosition);
    set({ position: newPosition, seekTimeout: null });
    if (currentEpisode) savePosition(currentEpisode.id, newPosition);
  },

  skipBackward: () => {
    const state = get();
    const { howlInstance, position, seekTimeout, currentEpisode, position: currentPos } = state;
    if (!howlInstance) return;
    if (seekTimeout) clearTimeout(seekTimeout);
    const newPosition = Math.max(position - 30, 0);
    state.captureEvent('seek_back', newPosition, currentPos);
    howlInstance.seek(newPosition);
    set({ position: newPosition, seekTimeout: null });
    if (currentEpisode) savePosition(currentEpisode.id, newPosition);
  },

  updatePosition: () => {
    const state = get();
    const { howlInstance, isPlaying, seekTimeout, currentEpisode, duration } = state;
    if (!howlInstance || !isPlaying) return;
    const pos = howlInstance.seek();
    if (typeof pos === 'number') {
      set({ position: pos });
      if (currentEpisode && duration > 0 && pos / duration > 0.9) {
        state.markEpisodePlayed(currentEpisode.id);
      }
    }
    if (get().isPlaying && !get().seekTimeout) {
      requestAnimationFrame(() => state.updatePosition());
    }
  },
}));