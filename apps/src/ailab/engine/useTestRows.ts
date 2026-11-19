import {useMemo} from 'react';

import {describesDataset} from './helpers/trainingSplit';
import {useAppSelector} from './hooks';
import {useProject} from './ProjectContext';
import {getData} from './selectors';

// Like train.init, ignores a saved split that no longer fits the dataset.
export function useTestRows(): ReadonlySet<number> {
  const {accuracyCheckRowIndices} = useProject().project;
  const rowCount = useAppSelector(state => getData(state).length);
  return useMemo(
    () =>
      accuracyCheckRowIndices &&
      describesDataset(accuracyCheckRowIndices, rowCount)
        ? new Set(accuracyCheckRowIndices)
        : new Set(),
    [accuracyCheckRowIndices, rowCount]
  );
}
