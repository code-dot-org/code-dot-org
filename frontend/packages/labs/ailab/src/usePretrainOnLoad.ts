import {useEffect} from 'react';

import {useAppSelector} from './hooks';
import {useProject} from './ProjectContext';
import {readyToTrain} from './redux';
import {useTrainingData} from './TrainingDataContext';
import {useTrainingRun} from './useTrainingRun';

export function usePretrainOnLoad() {
  const {project} = useProject();
  const {trainedModel} = useTrainingData();
  const {beginRun} = useTrainingRun();
  const pretrained = useAppSelector(state => !!state.mode?.pretrained);
  // A level change empties the data at once but resets the project in a later effect.
  const dataLoaded = useAppSelector(state => state.data.length > 0);
  const canTrain = readyToTrain(project);

  useEffect(() => {
    if (pretrained && dataLoaded && canTrain && !trainedModel) {
      beginRun();
    }
  }, [pretrained, dataLoaded, canTrain, trainedModel, beginRun]);
}
