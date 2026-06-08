import { useMemo } from 'react';
import type { Thread, ThreadSort } from '@/types';

/**
 * Pure sort function — no React dependencies.
 *
 * - 'hot': Reddit-style decay — score / (ageHours + 2)^1.5
 * - 'new': createdAt descending
 * - 'top': score descending
 */
export function sortThreads(threads: Thread[], mode: ThreadSort): Thread[] {
  const sorted = [...threads];
  const now = Date.now();

  switch (mode) {
    case 'hot':
      return sorted.sort((a, b) => {
        const ageA = (now - new Date(a.lastVoteAt).getTime()) / 3_600_000;
        const ageB = (now - new Date(b.lastVoteAt).getTime()) / 3_600_000;
        return (
          b.score / Math.pow(ageB + 2, 1.5) -
          a.score / Math.pow(ageA + 2, 1.5)
        );
      });
    case 'new':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'top':
      return sorted.sort((a, b) => b.score - a.score);
  }
}

/** Memoized hook wrapping sortThreads. */
export function useSort(threads: Thread[], mode: ThreadSort): Thread[] {
  return useMemo(() => sortThreads(threads, mode), [threads, mode]);
}
