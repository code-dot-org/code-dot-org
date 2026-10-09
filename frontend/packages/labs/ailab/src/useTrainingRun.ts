/*
  One training run writes to three places: the training data Redux still holds,
  the model, and the project. Starting and cancelling a run has to move all
  three together, so nothing else should drive them one at a time.
*/

import {useCallback} from 'react';

import {useProject} from './ProjectContext';
import {store} from './store';
import train from './train';
import {useTrainingData} from './TrainingDataContext';

export interface TrainingRunControls {
  beginRun: () => void;
  cancelRun: () => void;
}

export function useTrainingRun(): TrainingRunControls {
  const {setTrainedModel, snapshotTrainedModel, restoreTrainedModel} =
    useTrainingData();
  const {applyTrainingRun, snapshotTrainingRun, restoreTrainingRun} =
    useProject();

  const beginRun = useCallback(() => {
    snapshotTrainedModel();
    snapshotTrainingRun();
    train.init(store);
    const run = train.onClickTrain();
    setTrainedModel(run?.trainedModel);
    applyTrainingRun(run);
  }, [
    snapshotTrainedModel,
    snapshotTrainingRun,
    setTrainedModel,
    applyTrainingRun,
  ]);

  const cancelRun = useCallback(() => {
    train.cancel();
    restoreTrainedModel();
    restoreTrainingRun();
  }, [restoreTrainedModel, restoreTrainingRun]);

  return {beginRun, cancelRun};
}
