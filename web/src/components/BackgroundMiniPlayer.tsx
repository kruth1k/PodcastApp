'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { usePodcastStore } from '@/stores/podcastStore';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';

export function BackgroundMiniPlayer() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [debug, setDebug] = useState('');
  
  // Player state
  const currentEpisode = usePlayerStore((state) => state.currentEpisode);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const skipForward = usePlayerStore((state) => state.skipForward);
  const skipBackward = usePlayerStore((state) => state.skipBackward);
  
  // Podcast state
  const podcasts = usePodcastStore((state) => state.podcasts);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect when tab becomes hidden
  useVisibilityChange((hidden: boolean) => {
    const episode = usePlayerStore.getState().currentEpisode;
    setDebug(`hidden=${hidden} episode=${!!episode} mounted=${mounted}`);
    setIsVisible(hidden && !!episode);
  });

  if (!mounted) return null;
  
  // TEMP: Show always when playing for testing
  const showAlways = isPlaying && currentEpisode;
  if (!showAlways && !isVisible) {
    return null;
  }

  if (!currentEpisode) return null;

  // Find the podcast for the current episode
  const podcast = currentEpisode.podcast_id
    ? podcasts.find((p) => p.id === currentEpisode.podcast_id) || null
    : null;

  const handleClose = () => {
    if (isPlaying) {
      togglePlay(); // Stop playback
    }
    setIsVisible(false);
  };

  return (
    <div
      className="fixed top-4 right-4 z-[9999] min-w-[320px] bg-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden"
      role="region"
      aria-label="Background mini player"
      style={{ border: '2px solid red' }}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2a2a2a]">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm font-medium text-white truncate">
            {currentEpisode.title}
          </p>
          {podcast && (
            <p className="text-xs text-gray-400 truncate">
              {podcast.title}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 text-gray-400 hover:text-white transition-colors rounded"
          aria-label="Close mini player"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 py-3">
        {/* Skip Backward */}
        <button
          onClick={skipBackward}
          className="p-2 text-gray-300 hover:text-white transition-colors"
          aria-label="Skip backward 30 seconds"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            <text x="12" y="15" textAnchor="middle" fontSize="6" fill="white">30</text>
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={skipForward}
          className="p-2 text-gray-300 hover:text-white transition-colors"
          aria-label="Skip forward 15 seconds"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
            <text x="12" y="15" textAnchor="middle" fontSize="6" fill="white">15</text>
          </svg>
        </button>
      </div>
    </div>
  );
}