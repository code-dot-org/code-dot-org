import {useEffect, useRef} from 'react';

import {isPanelEnabled} from './helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from './hooks';
import {useProject} from './ProjectContext';
import {setCurrentPanel} from './redux';
import {store} from './store';
import train from './train';
import {useTrainingData} from './TrainingDataContext';

/*
  Rebuilds the model an opened project describes. A project carries the
  columns, the hyperparameters and the rows the run was graded against, but
  not the model itself, which is a live object the trainer has to make again.
*/
export function useRestoreModel() {
  const dispatch = useAppDispatch();
  const {project, opened} = useProject();
  const {trainedModel, setTrainedModel} = useTrainingData();
  const rebuilt = useRef(false);
  const canTest = useAppSelector(state =>
    isPanelEnabled(state, project, 'results')
  );

  useEffect(() => {
    if (rebuilt.current || !opened || trainedModel) {
      return;
    }
    if (!project.hyperparameters || !project.accuracyCheckRowIndices) {
      return;
    }
    rebuilt.current = true;
    const run = train.refit(store, project);
    // The run the project already describes; applying it would record it twice.
    if (run) {
      setTrainedModel(run.trainedModel);
    }
  }, [opened, trainedModel, project, setTrainedModel]);

  // The rebuilt run reaches the panel's conditions a render later.
  useEffect(() => {
    if (rebuilt.current && trainedModel && canTest) {
      dispatch(setCurrentPanel('results'));
    }
  }, [trainedModel, canTest, dispatch]);
}
