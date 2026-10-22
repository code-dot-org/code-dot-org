import {useEffect, useState} from 'react';

import {isPanelEnabled} from './helpers/navigationValidation';
import {useAppDispatch} from './hooks';
import {useProject} from './ProjectContext';
import {setCurrentPanel} from './redux';
import {store} from './store';
import train from './train';
import {useTrainingData} from './TrainingDataContext';

/*
  Rebuilds the model an opened project describes. A project carries the
  columns, the hyperparameters and the rows the run was graded against, but
  not the model itself, which is a live object the trainer has to make again.

  Returns whether that is still to come, so the lab can wait rather than show
  a project half opened.
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
    // The project already describes this run; applying it would record it twice.
    if (!run) {
      return;
    }
    setTrainedModel(run.trainedModel);

    // Rebuilding is what makes the results reachable, so open on them.
    if (isPanelEnabled(store.getState(), project, 'results')) {
      dispatch(setCurrentPanel('results'));
    }
  }, [attempted, opened, trainedModel, project, setTrainedModel, dispatch]);

  // Nothing to wait for until a project has been opened; a lab with no host
  // to open one never waits at all.
  return opened && !attempted;
}
