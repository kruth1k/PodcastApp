const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') return {};
  
  try {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = authData?.state?.accessToken;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  } catch {
    return {};
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
    if (!res.ok) throw new Error('Failed to fetch podcasts');
    return res.json();
  },

  getPodcast: async (id: string): Promise<Podcast> => {
    const res = await fetch(`${API_URL}/api/podcasts/${id}`, {
      headers: { ...getAuthHeaders() }
    });
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
    if (!res.ok) throw new Error('Failed to add podcast');
    return res.json();
  },

  deletePodcast: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/podcasts/${id}`, { 
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to delete podcast');
  },

  getEpisodes: async (podcastId: string): Promise<Episode[]> => {
    const res = await fetch(`${API_URL}/api/episodes?podcast_id=${podcastId}`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch episodes');
    return res.json();
  },

  refreshPodcast: async (podcastId: string): Promise<Podcast> => {
    const res = await fetch(`${API_URL}/api/podcasts/${podcastId}/refresh`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to refresh podcast');
    return res.json();
  },

  refreshAllPodcasts: async (): Promise<{ id: string; title: string; new_episodes: number; success: boolean }[]> => {
    const res = await fetch(`${API_URL}/api/podcasts/refresh-all`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
    });
    if (!res.ok) throw new Error('Failed to refresh all podcasts');
    return res.json();
  },
};