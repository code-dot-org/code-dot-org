import {useEffect, useState} from 'react';

import {isPanelEnabled} from './helpers/navigationValidation';
import {useAppDispatch} from './hooks';
import {useProject} from './ProjectContext';
import {setCurrentPanel} from './redux';
import {getSelectableColumns} from './selectors';
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

    const trainedOn = project.historicResults[0];
    const describesRun =
      project.hyperparameters && project.accuracyCheckRowIndices && trainedOn;
    if (trainedModel || !describesRun) {
      return;
    }

    const selectable = getSelectableColumns(store.getState());
    // Use columns from the last training run, not the current project selection,
    // in case they are different.
    const columns = [trainedOn.label, ...trainedOn.features];
    if (!columns.every(column => selectable.includes(column))) {
      return;
    }

    const run = train.refit(store, {
      ...project,
      labelColumn: trainedOn.label,
      selectedFeatures: trainedOn.features,
    });
    if (!run) {
      return;
    }
    setTrainedModel(run.trainedModel);

    /*
      Clicking a dataset loads it while the picker is still open.
      Don't move to the results panel in that case because the user
      hasn't actually selected the dataset yet.
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
