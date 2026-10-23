import {useEffect, useState} from 'react';

import {isPanelEnabled} from './helpers/navigationValidation';
import {useAppDispatch} from './hooks';
import {useProject} from './ProjectContext';
import {setCurrentPanel} from './redux';
import {store} from './store';
import train from './train';
import {useTrainingData} from './TrainingDataContext';

/*
  Rebuilds the model an opened project describes, and
  returns whether we are waiting for the model to be rebuilt.
*/
export function useRestoreModel(): boolean {
  const dispatch = useAppDispatch();
  const {project, isProjectLoaded} = useProject();
  const {trainedModel, setTrainedModel} = useTrainingData();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (attempted || !isProjectLoaded) {
      return;
    }
    setAttempted(true);

    const describesRun =
      project.hyperparameters && project.accuracyCheckRowIndices;
    if (trainedModel || !describesRun) {
      return;
    }

    const run = train.refit(store, project);
    if (!run) {
      return;
    }
    setTrainedModel(run.trainedModel);

    /*
      Clicking a dataset loads it while the picker is still open, so the
      project can open before the student has settled on one. Moving them to
      the results would make that click their choice.
    */
    const state = store.getState();
    if (
      state.currentPanel !== 'selectDataset' &&
      isPanelEnabled(state, project, 'results')
    ) {
      dispatch(setCurrentPanel('results'));
    }
  }, [
    attempted,
    isProjectLoaded,
    trainedModel,
    project,
    setTrainedModel,
    dispatch,
  ]);

  return isProjectLoaded && !attempted;
}
