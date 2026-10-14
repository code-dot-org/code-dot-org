import {useEffect} from 'react';

import {isPanelEnabled} from './helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from './hooks';
import {useProject} from './ProjectContext';
import {readyToTrain, setCurrentPanel} from './redux';
import {useTrainingData} from './TrainingDataContext';
import {useTrainingRun} from './useTrainingRun';

export function usePretrainOnLoad() {
  const dispatch = useAppDispatch();
  const {project} = useProject();
  const {trainedModel} = useTrainingData();
  const {beginRun} = useTrainingRun();
  const pretrained = useAppSelector(state => !!state.mode?.pretrained);
  const hideDatasetView = useAppSelector(
    state => !!state.mode?.hideDatasetView,
  );
  // A level change empties the data at once but resets the project in a later effect.
  const dataLoaded = useAppSelector(state => state.data.length > 0);
  const canTrain = readyToTrain(project);
  const canTest = useAppSelector(state =>
    isPanelEnabled(state, project, 'results'),
  );

  useEffect(() => {
    if (pretrained && dataLoaded && canTrain && !trainedModel) {
      beginRun();
    }
  }, [pretrained, dataLoaded, canTrain, trainedModel, beginRun]);

  // Waits for the project to hold the run, which lands a render after the store does.
  useEffect(() => {
    if (hideDatasetView && canTest) {
      dispatch(setCurrentPanel('results'));
    }
  }, [hideDatasetView, canTest, dispatch]);
}
