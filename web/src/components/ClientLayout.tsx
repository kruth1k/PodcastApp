'use client';

import { ReactNode } from 'react';
import { PlayerBar } from './PlayerBar';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PlayerBar />
    </>
  );
}