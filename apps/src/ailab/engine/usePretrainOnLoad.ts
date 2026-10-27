import {useEffect} from 'react';

import {isPanelEnabled} from './helpers/navigationValidation';
import {applyPresetColumns} from './helpers/projectColumns';
import {afterNextPaint} from './helpers/utils';
import {useAppDispatch, useAppSelector} from './hooks';
import {useProject} from './ProjectContext';
import {getHideDatasetView, readyToTrain, setCurrentPanel} from './redux';
import {getData} from './selectors';
import {useTrainingData} from './TrainingDataContext';
import {useTrainingRun} from './useTrainingRun';

// Trains a pretrained level on load, and returns whether that model is still to come.
export function usePretrainOnLoad(restoringModel: boolean): boolean {
  const dispatch = useAppDispatch();
  const {project} = useProject();
  const {trainedModel} = useTrainingData();
  const {beginRun} = useTrainingRun();
  const pretrained = useAppSelector(state => !!state.mode?.pretrained);
  const hideDatasetView = useAppSelector(getHideDatasetView);
  // A level change empties the data at once but resets the project in a later effect.
  const dataLoaded = useAppSelector(state => getData(state).length > 0);
  const canTrain = readyToTrain(project);
  const canTest = useAppSelector(state =>
    isPanelEnabled(state, project, 'results')
  );
  const presetColumns = useAppSelector(state => state.presetColumns);
  const lockedLabel = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const lockedFeatures = useAppSelector(state => !!state.mode?.lockFeatures);
  const data = useAppSelector(getData);
  // Unset until the metadata is in. ProjectContext applies it an effect later.
  const willTrain =
    !presetColumns ||
    readyToTrain(
      applyPresetColumns(
        project,
        presetColumns,
        lockedLabel,
        lockedFeatures,
        data
      )
    );
  const pretraining =
    pretrained && willTrain && dataLoaded && !trainedModel && !restoringModel;

  // Training blocks the page, so let the loading overlay paint first.
  useEffect(() => {
    if (!pretraining || !canTrain) {
      return;
    }
    return afterNextPaint(beginRun);
  }, [pretraining, canTrain, beginRun]);

  // The new run reaches `project` on the next render, so wait for canTest.
  useEffect(() => {
    if (hideDatasetView && canTest) {
      dispatch(setCurrentPanel('results'));
    }
  }, [hideDatasetView, canTest, dispatch]);

  return pretraining;
}
