'use client';

import { useEffect } from 'react';
import { usePlayerStore, Episode } from '@/stores/playerStore';

interface PodcastInfo {
  id: string;
  title: string;
  image_url?: string;
}

/**
 * Hook to integrate with the Media Session API
 * Sets up media metadata and action handlers for system notification controls
 */
export function useMediaSession(
  episode: Episode | null,
  podcast: PodcastInfo | null,
  isPlaying: boolean
) {
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const skipForward = usePlayerStore((state) => state.skipForward);
  const skipBackward = usePlayerStore((state) => state.skipBackward);

  useEffect(() => {
    // Guard: Media Session API only available in supported browsers
    if (!('mediaSession' in navigator)) {
      return;
    }

    const mediaSession = navigator.mediaSession;

    // Set metadata when episode and podcast are available
    if (episode && podcast) {
      const metadata = new MediaMetadata({
        title: episode.title,
        artist: podcast.title,
        artwork: podcast.image_url
          ? [{ src: podcast.image_url, sizes: '512x512', type: 'image/png' }]
          : [],
      });
      mediaSession.metadata = metadata;
    }

    // Register action handlers
    mediaSession.setActionHandler('play', () => {
      togglePlay();
    });

    mediaSession.setActionHandler('pause', () => {
      togglePlay();
    });

    mediaSession.setActionHandler('seekbackward', () => {
      skipBackward();
    });

    mediaSession.setActionHandler('seekforward', () => {
      skipForward();
    });
  }, [episode, podcast, isPlaying, togglePlay, skipForward, skipBackward]);
}