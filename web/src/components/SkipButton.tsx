'use client';

import { usePlayerStore } from '@/stores/playerStore';

interface SkipButtonProps {
  direction: 'forward' | 'backward';
  seconds?: number;
}

export function SkipButton({ direction, seconds }: SkipButtonProps) {
  const { skipForward, skipBackward } = usePlayerStore();

  const handleClick = () => {
    if (direction === 'forward') {
      skipForward();
    } else {
      skipBackward();
    }
  };

  const label = direction === 'forward' ? `Skip forward ${seconds || 15}s` : `Skip backward ${seconds || 30}s`;
  const icon = direction === 'forward' ? '▶▶' : '◀◀';

  return (
    <button
      onClick={handleClick}
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      aria-label={label}
      title={label}
    >
      <span className="text-sm font-medium">
        {icon}
        <span className="ml-1 text-xs">{seconds || (direction === 'forward' ? 15 : 30)}s</span>
      </span>
    </button>
  );
}

export function SkipForwardButton() {
  return <SkipButton direction="forward" seconds={15} />;
}

export function SkipBackwardButton() {
  return <SkipButton direction="backward" seconds={30} />;
}