'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { usePodcastStore } from '@/stores/podcastStore';
import { useMediaSession } from '@/hooks/useMediaSession';
import { SpeedSelector } from './SpeedSelector';
import { SkipBackwardButton, SkipForwardButton } from './SkipButton';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PlayerBar() {
  const [mounted, setMounted] = useState(false);
  const { currentEpisode, isPlaying, isBuffering, position, duration, togglePlay, seek } = usePlayerStore();
  const podcasts = usePodcastStore((state) => state.podcasts);

  const currentPodcast = currentEpisode?.podcast_id 
    ? podcasts.find(p => p.id === currentEpisode.podcast_id) 
    : null;

  useMediaSession(currentEpisode, currentPodcast ? { id: currentPodcast.id, title: currentPodcast.title, image_url: currentPodcast.image_url || undefined } : null, isPlaying);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!currentEpisode) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentEpisode.title}
          </p>
          <p className="text-xs text-gray-500 truncate">
            Episode
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SkipBackwardButton />
          
          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <SkipForwardButton />
        </div>

        <div className="flex-1 flex items-center justify-end gap-3 ml-4 min-w-0">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={position}
            onChange={handleSeek}
            className="w-24 sm:w-32 h-1 accent-blue-600"
            aria-label="Seek"
          />
          <span className="text-xs text-gray-500 tabular-nums min-w-[45px]">
            {formatTime(position)} / {formatTime(duration)}
          </span>
          <SpeedSelector />
        </div>
      </div>
    </div>
  );
}