/*
  Training data: what a training run produces. The model is a live class
  instance, and the arrays that will join it here are rebuilt from the dataset
  rather than saved with the project, so none of it belongs in Redux.
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

export interface TrainingData {
  trainedModel?: TrainedModel;
}

export interface TrainingDataContextValue extends TrainingData {
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
  const levelLoadCount = useAppSelector(state => state.levelLoadCount);
  const loadedLevel = useRef(levelLoadCount);

  // loadLevel() runs outside React and so can't clear the model itself. The
  // guard skips the first run, where there is nothing to clear yet.
  useEffect(() => {
    if (loadedLevel.current === levelLoadCount) {
      return;
    }
    loadedLevel.current = levelLoadCount;
    setTrainedModel(undefined);
    previousTrainedModel.current = undefined;
  }, [levelLoadCount]);

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
