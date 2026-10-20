/*
  Watches for a reset signal from Redux and calls the provided callback when it occurs.
*/

import {useEffect, useRef} from 'react';

import {useAppSelector} from './hooks';

export function useResetSignal(
  onReset: (keepsPendingProject: boolean) => void
): void {
  const resetCount = useAppSelector(state => state.resetCount);
  const keepsPendingProject = useAppSelector(
    state => state.resetKeepsPendingProject
  );
  const appliedReset = useRef(resetCount);

  useEffect(() => {
    // Nothing to clear on the first render, and nothing to redo on later ones.
    if (appliedReset.current === resetCount) {
      return;
    }
    appliedReset.current = resetCount;
    onReset(keepsPendingProject);
  }, [resetCount, keepsPendingProject, onReset]);
}
