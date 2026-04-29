'use client';

import { usePodcastStore } from '@/stores/podcastStore';
import EpisodeCard from './EpisodeCard';

export default function EpisodeList() {
  const { episodes, isLoading } = usePodcastStore();

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

  return (
    <div className="space-y-3">
      {episodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  );
}