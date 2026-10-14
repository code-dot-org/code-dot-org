/*
  Watches for a reset signal from Redux and calls the provided callback when it occurs.
*/

import {useEffect, useRef} from 'react';

import {useAppSelector} from './hooks';
import type {AilabProject} from './types';

export interface ResetSignal {
  keepsHistoricResults: boolean;
  // Set when a level load caused the reset, carrying the student's saved work
  // if they have any.
  levelLoad?: {project?: AilabProject};
}

export function useResetSignal(onReset: (signal: ResetSignal) => void): void {
  const resetCount = useAppSelector(state => state.resetCount);
  const keepsHistoricResults = useAppSelector(
    state => state.resetKeepsHistoricResults,
  );
  const levelLoad = useAppSelector(state => state.resetLevelLoad);
  const appliedReset = useRef(resetCount);

  useEffect(() => {
    // Nothing to clear on the first render, and nothing to redo on later ones.
    if (appliedReset.current === resetCount) {
      return;
    }
    appliedReset.current = resetCount;
    onReset({keepsHistoricResults, levelLoad});
  }, [resetCount, keepsHistoricResults, levelLoad, onReset]);
}
