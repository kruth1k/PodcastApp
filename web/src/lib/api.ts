const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  title: string;
  description: string | null;
  audio_url: string;
  duration: number | null;
  published_at: string | null;
  guid: string;
}

export const api = {
  getPodcasts: async (): Promise<Podcast[]> => {
    const res = await fetch(`${API_URL}/api/podcasts`);
    if (!res.ok) throw new Error('Failed to fetch podcasts');
    return res.json();
  },

  getPodcast: async (id: string): Promise<Podcast> => {
    const res = await fetch(`${API_URL}/api/podcasts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch podcast');
    return res.json();
  },

  addPodcast: async (feedUrl: string): Promise<Podcast> => {
    const res = await fetch(`${API_URL}/api/podcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feed_url: feedUrl })
    });
    if (!res.ok) throw new Error('Failed to add podcast');
    return res.json();
  },

  deletePodcast: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/podcasts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete podcast');
  },

  getEpisodes: async (podcastId: string): Promise<Episode[]> => {
    const res = await fetch(`${API_URL}/api/episodes?podcast_id=${podcastId}`);
    if (!res.ok) throw new Error('Failed to fetch episodes');
    return res.json();
  },
};