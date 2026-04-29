'use client';

import { Podcast } from '@/lib/api';
import { usePodcastStore } from '@/stores/podcastStore';

interface PodcastCardProps {
  podcast: Podcast;
}

export default function PodcastCard({ podcast }: PodcastCardProps) {
  const { selectPodcast, removePodcast } = usePodcastStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to unsubscribe from this podcast?')) {
      await removePodcast(podcast.id);
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
  );
}