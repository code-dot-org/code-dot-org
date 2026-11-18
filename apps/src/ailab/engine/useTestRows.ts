import {useMemo} from 'react';

import {useProject} from './ProjectContext';

// The rows the project's model is tested on rather than trained on.
export function useTestRows(): ReadonlySet<number> {
  const {accuracyCheckRowIndices} = useProject().project;
  return useMemo(
    () => new Set(accuracyCheckRowIndices),
    [accuracyCheckRowIndices]
  );
}
