const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const NGROK_SKIP_HEADER = { 'ngrok-skip-browser-warning': 'true' };

const handleAuthError = async (res: Response): Promise<boolean> => {
  if (res.status === 401 || res.status === 403) {
    try {
      const { useAuthStore } = await import('@/stores/authStore');
      useAuthStore.getState().logout();
      return true;
    } catch {
      return true;
    }
  }
  return false;
};

const getAuthHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') return {};
  
  try {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = authData?.state?.accessToken;
    return token ? { 'Authorization': `Bearer ${token}`, ...NGROK_SKIP_HEADER } : { ...NGROK_SKIP_HEADER };
  } catch {
    return { ...NGROK_SKIP_HEADER };
  }
};

export interface Podcast {
  id: string;
  title: string;
  description: string | null;
  feed_url: string;
  image_url: string | null;
  author: string | null;
  created_at: string;
  updated_at: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  podcast_id?: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: number | null;
  published_at: string | null;
  guid: string;
}

export const api = {
  getPodcasts: async (): Promise<Podcast[]> => {
    const res = await fetch(`${API_URL}/api/podcasts`, {
      headers: { ...getAuthHeaders() }
    });
    if (await handleAuthError(res)) throw new Error('Session expired');
    if (!res.ok) throw new Error('Failed to fetch podcasts');
    return res.json();
  },

  getPodcast: async (id: string): Promise<Podcast> => {
    const res = await fetch(`${API_URL}/api/podcasts/${id}`, {
      headers: { ...getAuthHeaders() }
    });
    if (await handleAuthError(res)) throw new Error('Session expired');
    if (!res.ok) throw new Error('Failed to fetch podcast');
    return res.json();
  },

  addPodcast: async (feedUrl: string): Promise<Podcast> => {
    const res = await fetch(`${API_URL}/api/podcasts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ feed_url: feedUrl })
    });
    if (await handleAuthError(res)) throw new Error('Session expired');
    if (!res.ok) throw new Error('Failed to add podcast');
    return res.json();
  },

  deletePodcast: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/podcasts/${id}`, { 
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    if (await handleAuthError(res)) throw new Error('Session expired');
    if (!res.ok) throw new Error('Failed to delete podcast');
  },

  getEpisodes: async (podcastId: string, offset: number = 0, limit: number = 50, sortBy: string = 'newest'): Promise<{ episodes: Episode[], total: number }> => {
    const res = await fetch(`${API_URL}/api/episodes?podcast_id=${podcastId}&offset=${offset}&limit=${limit}&sort_by=${sortBy}`, {
      headers: { ...getAuthHeaders() }
    });
    if (await handleAuthError(res)) throw new Error('Session expired');
    if (!res.ok) throw new Error('Failed to fetch episodes');
    const episodes = await res.json();
    return { episodes, total: episodes.length };
  },

  getEpisodesCount: async (podcastId: string): Promise<number> => {
    const res = await fetch(`${API_URL}/api/episodes/count?podcast_id=${podcastId}`, {
      headers: { ...getAuthHeaders() }
    });
    if (await handleAuthError(res)) throw new Error('Session expired');
    if (!res.ok) throw new Error('Failed to fetch episodes count');
    const data = await res.json();
    return data.count;
  },

  refreshPodcast: async (podcastId: string): Promise<Podcast> => {
    const res = await fetch(`${API_URL}/api/podcasts/${podcastId}/refresh`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
    if (await handleAuthError(res)) throw new Error('Session expired');
    if (!res.ok) throw new Error('Failed to refresh podcast');
    return res.json();
  },

  refreshAllPodcasts: async (): Promise<{ id: string; title: string; new_episodes: number; success: boolean }[]> => {
    const res = await fetch(`${API_URL}/api/podcasts/refresh-all`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
    if (await handleAuthError(res)) throw new Error('Session expired');
    if (!res.ok) throw new Error('Failed to refresh all podcasts');
    return res.json();
  },

  getLastPlayed: async (): Promise<{
    episode_id: string;
    position_seconds: number;
    episode: {
      id: string;
      title: string;
      audio_url: string;
      podcast_id: string;
    };
  } | null> => {
    const res = await fetch(`${API_URL}/api/stats/last-played`, {
      headers: { ...getAuthHeaders() }
    });
    if (res.status === 404 || res.status === 204 || res.status === 200 && res.headers.get('content-length') === '0') {
      return null;
    }
    if (await handleAuthError(res)) {
      return null;
    }
    if (!res.ok) throw new Error('Failed to fetch last played');
    return res.json();
  },
};