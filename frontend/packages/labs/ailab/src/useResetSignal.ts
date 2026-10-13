/*
  Watches for a reset signal from Redux and calls the provided callback when it occurs.
*/

import {useEffect, useRef} from 'react';

import {useAppSelector} from './hooks';

export function useResetSignal(
  onReset: (keepsHistoricResults: boolean) => void,
): void {
  const resetCount = useAppSelector(state => state.resetCount);
  const keepsHistoricResults = useAppSelector(
    state => state.resetKeepsHistoricResults,
  );
  const appliedReset = useRef(resetCount);

  useEffect(() => {
    // Nothing to clear on the first render, and nothing to redo on later ones.
    if (appliedReset.current === resetCount) {
      return;
    }
    appliedReset.current = resetCount;
    onReset(keepsHistoricResults);
  }, [resetCount, keepsHistoricResults, onReset]);
}
