'use client';

import { usePodcastStore } from '@/stores/podcastStore';
import PodcastCard from './PodcastCard';

export default function PodcastList() {
  const { podcasts, isLoading, fetchPodcasts } = usePodcastStore();

  if (isLoading && podcasts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading podcasts...</div>
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No podcasts yet</p>
        <p className="text-sm text-gray-400">Add a podcast using the form above</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {podcasts.map((podcast) => (
        <PodcastCard key={podcast.id} podcast={podcast} />
      ))}
    </div>
  );
}