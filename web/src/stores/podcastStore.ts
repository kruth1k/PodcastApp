import { create } from 'zustand';
import { api, Podcast, Episode } from '@/lib/api';

interface PodcastStore {
  podcasts: Podcast[];
  selectedPodcast: Podcast | null;
  episodes: Episode[];
  isLoading: boolean;
  error: string | null;
  fetchPodcasts: () => Promise<void>;
  addPodcast: (feedUrl: string) => Promise<void>;
  removePodcast: (id: string) => Promise<void>;
  selectPodcast: (podcast: Podcast | null) => void;
  fetchEpisodes: (podcastId: string) => Promise<void>;
}

export const usePodcastStore = create<PodcastStore>((set, get) => ({
  podcasts: [],
  selectedPodcast: null,
  episodes: [],
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
      set({ selectedPodcast: null, episodes: [] });
      await get().fetchPodcasts();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectPodcast: (podcast: Podcast | null) => {
    set({ selectedPodcast: podcast, episodes: [] });
    if (podcast) {
      get().fetchEpisodes(podcast.id);
    }
  },

  fetchEpisodes: async (podcastId: string) => {
    try {
      const episodes = await api.getEpisodes(podcastId);
      set({ episodes });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));