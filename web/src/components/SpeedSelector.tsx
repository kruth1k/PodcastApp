'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/stores/playerStore';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

export function SpeedSelector() {
  const [mounted, setMounted] = useState(false);
  const { playbackRate, setPlaybackRate } = usePlayerStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatSpeed = (speed: number) => {
    if (speed === 1) return '1x';
    if (speed % 1 === 0) return `${speed}x`;
    return `${speed}x`;
  };

  if (!mounted) {
    return (
      <button className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded">
        1x
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        aria-label={`Playback speed ${formatSpeed(playbackRate)}`}
      >
        {formatSpeed(playbackRate)}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  setPlaybackRate(speed);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                  playbackRate === speed
                    ? 'text-blue-600 font-medium bg-blue-50'
                    : 'text-gray-700'
                }`}
              >
                {formatSpeed(speed)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}