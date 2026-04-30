'use client';

import { useState } from 'react';
import { usePodcastStore } from '@/stores/podcastStore';
import EpisodeCard from './EpisodeCard';

const EPISODES_PER_PAGE = 20;

export default function EpisodeList() {
  const { episodes, isLoading } = usePodcastStore();
  const [visibleCount, setVisibleCount] = useState(EPISODES_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading episodes...</div>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No episodes found</p>
      </div>
    );
  }

  const visibleEpisodes = episodes.slice(0, visibleCount);
  const hasMore = visibleCount < episodes.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + EPISODES_PER_PAGE);
  };

  return (
    <div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {visibleEpisodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Load More ({episodes.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}