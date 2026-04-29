'use client';

import { useState } from 'react';
import { Episode } from '@/lib/api';
import { usePlayerStore } from '@/stores/playerStore';

interface EpisodeCardProps {
  episode: Episode;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return '';
  }
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const playEpisode = usePlayerStore((state) => state.playEpisode);
  const togglePlayed = usePlayerStore((state) => state.togglePlayed);
  const currentEpisode = usePlayerStore((state) => state.currentEpisode);
  const isCurrentEpisode = currentEpisode?.id === episode.id;
  const playedEpisodes = usePlayerStore((state) => state.playedEpisodes);
  const played = playedEpisodes.has(episode.id) || (typeof window !== 'undefined' && localStorage.getItem(`podcast_played_${episode.id}`) === 'true');

  const handlePlay = () => {
    playEpisode({
      id: episode.id,
      podcast_id: episode.podcast_id || '',
      title: episode.title,
      description: episode.description || '',
      audio_url: episode.audio_url,
      duration: episode.duration,
      published_at: episode.published_at || '',
      guid: episode.guid,
    });
  };

  const handleTogglePlayed = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlayed(episode.id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 ${played ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium truncate ${played ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {episode.title}
            </h4>
            {isCurrentEpisode && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Playing</span>
            )}
            {played && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Played
              </span>
            )}
            {!played && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {episode.published_at && (
              <span>{formatDate(episode.published_at)}</span>
            )}
            {episode.duration && (
              <span>{formatDuration(episode.duration)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlayed}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
            aria-label={played ? 'Mark as unplayed' : 'Mark as played'}
            title={played ? 'Mark as unplayed' : 'Mark as played'}
          >
            <svg className="w-5 h-5" fill={played ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={handlePlay}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex-shrink-0"
            aria-label={`Play ${episode.title}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>
      
      {episode.description && (
        <div className="mt-2">
          <p className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
            {episode.description.replace(/<[^>]*>/g, '')}
          </p>
          {episode.description.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-500 hover:text-blue-600 mt-1"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}