import { create } from 'zustand';
import { api, Podcast } from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  podcastTitle: string;
  episodeId: string;
  podcastId: string;
}

interface PodcastStore {
  podcasts: Podcast[];
  selectedPodcast: Podcast | null;
  isLoading: boolean;
  error: string | null;
  fetchPodcasts: () => Promise<void>;
  addPodcast: (feedUrl: string) => Promise<void>;
  removePodcast: (id: string) => Promise<void>;
  selectPodcast: (podcast: Podcast | null) => void;
  searchPodcasts: (query: string) => Podcast[];
  searchEpisodes: (query: string) => SearchResult[];
}

export const usePodcastStore = create<PodcastStore>((set, get) => ({
  podcasts: [],
  selectedPodcast: null,
  isLoading: false,
  error: null,

  fetchPodcasts: async () => {
    set({ isLoading: true, error: null });
    try {
      const podcasts = await api.getPodcasts();
      set({ podcasts, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addPodcast: async (feedUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.addPodcast(feedUrl);
      await get().fetchPodcasts();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  removePodcast: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deletePodcast(id);
      set({ selectedPodcast: null });
      await get().fetchPodcasts();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectPodcast: (podcast: Podcast | null) => {
    set({ selectedPodcast: podcast });
  },

  searchPodcasts: (query: string): Podcast[] => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const lowerQuery = trimmed.toLowerCase();
    return get().podcasts.filter(p => 
      p.title.toLowerCase().includes(lowerQuery)
    );
  },

  searchEpisodes: (query: string): SearchResult[] => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const lowerQuery = trimmed.toLowerCase();
    const results: SearchResult[] = [];
    
    for (const podcast of get().podcasts) {
      for (const episode of podcast.episodes || []) {
        if (episode.title.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: episode.id,
            title: episode.title,
            podcastTitle: podcast.title,
            episodeId: episode.id,
            podcastId: podcast.id,
          });
          if (results.length >= 10) return results;
        }
      }
    }
    return results;
  },
}));