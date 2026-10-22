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
  const {project, opened} = useProject();
  const {trainedModel, setTrainedModel} = useTrainingData();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (attempted || !opened) {
      return;
    }
    setAttempted(true);

    const describesRun =
      project.hyperparameters && project.accuracyCheckRowIndices;
    if (trainedModel || !describesRun) {
      return;
    }

    const run = train.refit(store, project);
    // If the run is invalid, drop it.
    if (!run) {
      return;
    }
    setTrainedModel(run.trainedModel);

    if (isPanelEnabled(store.getState(), project, 'results')) {
      dispatch(setCurrentPanel('results'));
    }
  }, [attempted, opened, trainedModel, project, setTrainedModel, dispatch]);

  // Nothing to wait for until a project has been opened; a lab with no host
  // to open one never waits at all.
  return opened && !attempted;
}
