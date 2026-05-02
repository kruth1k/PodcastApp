'use client';

import { useState } from 'react';
import { Podcast, api } from '@/lib/api';
import { usePodcastStore } from '@/stores/podcastStore';

interface PodcastCardProps {
  podcast: Podcast;
}

export default function PodcastCard({ podcast }: PodcastCardProps) {
  const { selectPodcast, removePodcast } = usePodcastStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to unsubscribe from this podcast?')) {
      await removePodcast(podcast.id);
    }
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    try {
      await api.refreshPodcast(podcast.id);
    } catch (error) {
      alert('Failed to refresh podcast');
    } finally {
      setRefreshing(false);
    }
  };

  const episodeCount = (podcast as any).episode_count || podcast.episodes?.length || 0;

  return (
    <div 
      onClick={() => selectPodcast(podcast)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
          {podcast.image_url ? (
            <img 
              src={podcast.image_url} 
              alt={podcast.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{podcast.title}</h3>
          <p className="text-sm text-gray-500 truncate">{podcast.author || 'Unknown author'}</p>
          <p className="text-xs text-gray-400 mt-1">{episodeCount} episodes</p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-400 hover:text-blue-500 p-1 disabled:opacity-50"
            title="Refresh feed"
          >
            {refreshing ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 p-1"
            title="Unsubscribe"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}