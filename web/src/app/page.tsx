'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePodcastStore } from '@/stores/podcastStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import PodcastList from '@/components/PodcastList';
import EpisodeList from '@/components/EpisodeList';
import SearchResults from '@/components/SearchResults';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';

export default function Home() {
  const [feedUrl, setFeedUrl] = useState('');
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { selectedPodcast, selectPodcast, addPodcast, fetchPodcasts, isLoading, error, searchEpisodes, searchPodcasts, podcasts } = usePodcastStore();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPodcasts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      // Search local podcasts and episodes
      const podcastResults = searchPodcasts(searchQuery);
      const episodeResults = searchEpisodes(searchQuery);
      
      // Combine local results
      const localResults = [
        ...podcastResults.map(p => ({ type: 'podcast' as const, id: p.id, title: p.title, podcastTitle: p.title, podcastId: p.id })),
        ...episodeResults.map(e => ({ ...e, type: 'episode' as const }))
      ];
      
      // If no local results, search iTunes
      if (localResults.length === 0 && searchQuery.trim().length >= 2) {
        try {
          const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=podcast&limit=10`);
          const itunesData = await itunesRes.json();
          const itunesResults = itunesData.results.map((r: any) => ({
            type: 'discovery' as const,
            id: r.collectionId?.toString() || r.trackId?.toString() || Math.random().toString(),
            title: r.collectionName || r.trackName,
            podcastTitle: r.artistName,
            podcastId: '',
            feedUrl: r.feedUrl
          }));
          setSearchResults(itunesResults);
          setShowResults(true);
          return;
        } catch (err) {
          console.error('iTunes search failed:', err);
        }
      }
      
      setSearchResults(localResults.slice(0, 10));
      setShowResults(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, searchEpisodes, searchPodcasts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedUrl.trim()) return;
    await addPodcast(feedUrl.trim());
    setFeedUrl('');
  };

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    try {
      await api.refreshAllPodcasts();
      await fetchPodcasts();
    } catch (err) {
      alert('Failed to refresh podcasts');
    } finally {
      setRefreshingAll(false);
    }
  };

  const handleSearchSelect = async (podcastId: string, episodeId?: string, feedUrl?: string) => {
    // If it's a discovery result (not in library), add the podcast
    if (feedUrl) {
      try {
        await addPodcast(feedUrl);
        setShowResults(false);
        setSearchQuery('');
      } catch (err) {
        console.error('Failed to add podcast:', err);
      }
      return;
    }
    
    const podcast = podcasts.find((p) => p.id === podcastId);
    if (podcast) {
      selectPodcast(podcast);
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setSearchQuery('');
    }
  };

  if (!isAuthenticated) {
    return showLogin ? (
      <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PodcastStats</h1>
          <p className="text-gray-500 mt-1">Track your podcast listening statistics</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/stats"
            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            View Stats
          </Link>
          <button
            onClick={handleRefreshAll}
          disabled={refreshingAll}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
        >
          {refreshingAll ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh All
            </>
          )}
        </button>
        </div>
      </header>

      <div className="mb-4" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search podcasts and episodes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SearchResults
            results={searchResults}
            onSelect={handleSearchSelect}
            isOpen={showResults}
          />
        </div>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="Enter podcast RSS feed URL..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Podcast'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Podcasts</h2>
          <PodcastList />
        </div>

        <div>
          {selectedPodcast ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => selectPodcast(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
                <h2 className="text-xl font-semibold">{selectedPodcast.title}</h2>
              </div>
              <EpisodeList />
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Select a podcast to view episodes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}