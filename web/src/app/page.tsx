'use client';

import { useState, useEffect } from 'react';
import { usePodcastStore } from '@/stores/podcastStore';
import PodcastList from '@/components/PodcastList';
import EpisodeList from '@/components/EpisodeList';

export default function Home() {
  const [feedUrl, setFeedUrl] = useState('');
  const { selectedPodcast, selectPodcast, addPodcast, fetchPodcasts, isLoading, error } = usePodcastStore();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedUrl.trim()) return;
    await addPodcast(feedUrl.trim());
    setFeedUrl('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PodcastStats</h1>
        <p className="text-gray-500 mt-1">Track your podcast listening statistics</p>
      </header>

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