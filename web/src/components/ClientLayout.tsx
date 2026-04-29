'use client';

import { ReactNode } from 'react';
import { PlayerBar } from './PlayerBar';
import { BackgroundMiniPlayer } from './BackgroundMiniPlayer';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PlayerBar />
      <BackgroundMiniPlayer />
    </>
  );
}