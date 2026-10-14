/*
  What a level does for itself when it opens. A saved project is rebuilt from
  the dataset; a pretrained level with nothing to rebuild trains instead.
  Either way only the first model of a level is produced, never a replacement.

  A level that hides the dataset view also moves itself on to the results.
*/

import {useEffect, useRef} from 'react';

import {isPanelEnabled} from './helpers/navigationValidation';
import {useAppDispatch, useAppSelector} from './hooks';
import {useProject} from './ProjectContext';
import {getHideDatasetView, readyToTrain, setCurrentPanel} from './redux';
import {getSelectableColumns} from './selectors';
import {store} from './store';
import train from './train';
import {useTrainingData} from './TrainingDataContext';
import {useTrainingRun} from './useTrainingRun';

export function useModelOnLoad() {
  const dispatch = useAppDispatch();
  const {project} = useProject();
  const {trainedModel, setTrainedModel} = useTrainingData();
  const {beginRun} = useTrainingRun();
  const pretrained = useAppSelector(state => !!state.mode?.pretrained);
  const hideDatasetView = useAppSelector(getHideDatasetView);
  const canTest = useAppSelector(state =>
    isPanelEnabled(state, project, 'results'),
  );
  // A level change empties the data at once but resets the project in a later effect.
  const dataLoaded = useAppSelector(state => state.data.length > 0);
  /*
    The project's columns are reconciled against the dataset a render after it
    arrives, and rebuilding on a column the dataset lacks would train on
    nothing rather than fail.
  */
  const columnsInDataset = useAppSelector<boolean>(state => {
    const selectable = getSelectableColumns(state);
    return (
      (project.labelColumn === undefined ||
        selectable.includes(project.labelColumn)) &&
      project.selectedFeatures.every(feature => selectable.includes(feature))
    );
  });
  const resetCount = useAppSelector(state => state.resetCount);
  const rebuiltFor = useRef<number | undefined>(undefined);
  const canTrain = readyToTrain(project);

  useEffect(() => {
    if (!dataLoaded || !columnsInDataset) {
      return;
    }

    // A project that describes no model, or no longer describes this dataset,
    // gets one attempt and then leaves the level untrained.
    if (rebuiltFor.current !== resetCount) {
      rebuiltFor.current = resetCount;
      const rebuilt = train.refit(store, project);
      if (rebuilt) {
        setTrainedModel(rebuilt.trainedModel);
        return;
      }
    }

    if (pretrained && canTrain) {
      beginRun();
    }
  }, [
    dataLoaded,
    columnsInDataset,
    trainedModel,
    resetCount,
    project,
    setTrainedModel,
    pretrained,
    canTrain,
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
