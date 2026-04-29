'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook to detect page visibility changes (minimize, tab switch)
 * @param callback - Called with true when hidden, false when visible
 */
export function useVisibilityChange(callback: (hidden: boolean) => void) {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      memoizedCallback(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Call once on mount to get initial state
    memoizedCallback(document.hidden);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [memoizedCallback]);
}