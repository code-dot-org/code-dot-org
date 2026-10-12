/*
  Training data: what a training run produces.
*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {useAppSelector} from './hooks';
import type {TrainedModel} from './types';

export interface TrainingDataContextValue {
  trainedModel?: TrainedModel;
  setTrainedModel: (model?: TrainedModel) => void;
  // Taken before a training run so cancelling it can put back what was there.
  snapshotTrainedModel: () => void;
  restoreTrainedModel: () => void;
}

const TrainingDataContext = createContext<TrainingDataContextValue | undefined>(
  undefined,
);

interface TrainingDataProviderProps {
  children: ReactNode;
}

export const TrainingDataProvider = ({children}: TrainingDataProviderProps) => {
  const [trainedModel, setTrainedModel] = useState<TrainedModel | undefined>();
  const previousTrainedModel = useRef<TrainedModel | undefined>(undefined);
  const resetCount = useAppSelector(state => state.resetCount);
  const appliedReset = useRef(resetCount);

  useEffect(() => {
    if (appliedReset.current === resetCount) {
      return;
    }
    appliedReset.current = resetCount;
    setTrainedModel(undefined);
    previousTrainedModel.current = undefined;
  }, [resetCount]);

  const snapshotTrainedModel = useCallback(() => {
    previousTrainedModel.current = trainedModel;
  }, [trainedModel]);

  const restoreTrainedModel = useCallback(() => {
    setTrainedModel(previousTrainedModel.current);
  }, []);

  const value = useMemo(
    () => ({
      trainedModel,
      setTrainedModel,
      snapshotTrainedModel,
      restoreTrainedModel,
    }),
    [trainedModel, snapshotTrainedModel, restoreTrainedModel],
  );

  return (
    <TrainingDataContext.Provider value={value}>
      {children}
    </TrainingDataContext.Provider>
  );
};

export function useTrainingData(): TrainingDataContextValue {
  const value = useContext(TrainingDataContext);
  if (!value) {
    throw new Error('useTrainingData requires a TrainingDataProvider');
  }
  return value;
}
