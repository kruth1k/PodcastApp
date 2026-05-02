import { create } from 'zustand';
import { api, Podcast, Episode } from '@/lib/api';

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
  episodes: Episode[];
  episodesTotal: number;
  episodesOffset: number;
  isLoadingEpisodes: boolean;
  isLoading: boolean;
  error: string | null;
  fetchPodcasts: () => Promise<void>;
  addPodcast: (feedUrl: string) => Promise<void>;
  removePodcast: (id: string) => Promise<void>;
  selectPodcast: (podcast: Podcast | null) => void;
  fetchEpisodes: (podcastId: string) => Promise<void>;
  loadMoreEpisodes: (podcastId: string) => Promise<void>;
  searchPodcasts: (query: string) => Podcast[];
  searchEpisodes: (query: string) => SearchResult[];
}

export const usePodcastStore = create<PodcastStore>((set, get) => ({
  podcasts: [],
  selectedPodcast: null,
  episodes: [],
  episodesTotal: 0,
  episodesOffset: 0,
  isLoadingEpisodes: false,
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
    set({ selectedPodcast: podcast, episodes: [], episodesTotal: 0, episodesOffset: 0 });
    if (podcast) {
      get().fetchEpisodes(podcast.id);
    }
  },

  fetchEpisodes: async (podcastId: string) => {
    try {
      set({ isLoadingEpisodes: true });
      const total = await api.getEpisodesCount(podcastId);
      const { episodes } = await api.getEpisodes(podcastId, 0, 50);
      set({ episodes, episodesTotal: total, episodesOffset: 50, isLoadingEpisodes: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoadingEpisodes: false });
    }
  },

  loadMoreEpisodes: async (podcastId: string) => {
    const { episodes, episodesOffset, episodesTotal } = get();
    if (episodes.length >= episodesTotal || get().isLoadingEpisodes) return;
    
    try {
      set({ isLoadingEpisodes: true });
      const { episodes: moreEpisodes } = await api.getEpisodes(podcastId, episodesOffset, 50);
      set({ 
        episodes: [...episodes, ...moreEpisodes], 
        episodesOffset: episodesOffset + 50,
        isLoadingEpisodes: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoadingEpisodes: false });
    }
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