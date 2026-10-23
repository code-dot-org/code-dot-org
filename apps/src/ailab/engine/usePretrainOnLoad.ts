import {useEffect} from 'react';

import {isPanelEnabled} from './helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from './hooks';
import {useProject} from './ProjectContext';
import {getHideDatasetView, readyToTrain, setCurrentPanel} from './redux';
import {useTrainingData} from './TrainingDataContext';
import {useTrainingRun} from './useTrainingRun';

/*
  Trains a pretrained level on load, once the restore has had its turn: a
  saved run that cannot be rebuilt has to be replaced, and such a level
  offers the student neither a retrain nor a Start Over.
*/
export function usePretrainOnLoad(restoringModel: boolean) {
  const dispatch = useAppDispatch();
  const {project} = useProject();
  const {trainedModel} = useTrainingData();
  const {beginRun} = useTrainingRun();
  const pretrained = useAppSelector(state => !!state.mode?.pretrained);
  const hideDatasetView = useAppSelector(getHideDatasetView);
  // A level change empties the data at once but resets the project in a later effect.
  const dataLoaded = useAppSelector(state => state.data.length > 0);
  const canTrain = readyToTrain(project);
  const canTest = useAppSelector(state =>
    isPanelEnabled(state, project, 'results')
  );

  useEffect(() => {
    if (
      pretrained &&
      dataLoaded &&
      canTrain &&
      !trainedModel &&
      !restoringModel
    ) {
      beginRun();
    }
  }, [
    pretrained,
    dataLoaded,
    canTrain,
    trainedModel,
    restoringModel,
    beginRun,
  ]);

  // The new run reaches `project` on the next render, so wait for canTest.
  // TODO: Add loading state for before training finishes.
  useEffect(() => {
    if (hideDatasetView && canTest) {
      dispatch(setCurrentPanel('results'));
    }
  }, [hideDatasetView, canTest, dispatch]);
}
