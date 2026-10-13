/* Generic machine learning handlers that route to the selected trainer. */

import type {Store} from 'redux';

import {TestDataLocations, PERCENT_OF_DATASET_FOR_TESTING} from './constants';
import {buildOptionNumberKey} from './helpers/columnDetails';
import {getRandomInt} from './helpers/utils';
import {convertValueForTraining} from './helpers/valueConversion';
import type {RootState, TrainingResults} from './redux';
import {
  getTrainingResults,
  restoreTrainingResults,
  setFeatureNumberKey,
  setTrainingExamples,
  setTrainingLabels,
  setAccuracyCheckExamples,
  setAccuracyCheckLabels,
} from './redux';
import {getSelectedCategoricalColumns} from './selectors';
import {buildTrainer} from './trainers';
import type {Trainer, TrainingRun} from './trainers/types';
import type {AilabProject, DataRow, TrainedModel} from './types';

/* Builds a hash that maps selected categorical features to their option-
  number keys and dispatches that hash to the Redux store.
  @return {
    feature1: {
      option1 : 0,
      option2 : 1,
      option3: 2,
      ...
    },
    feature2: {
      option1 : 0,
      option2 : 1,
      ...
    }
  }
  */

const buildOptionNumberKeysByFeature = (
  store: Store<RootState>,
  project: AilabProject,
): void => {
  const state = store.getState();
  const optionsMappedToNumbersByFeature: Record<
    string,
    Record<string, number>
  > = {};
  const categoricalColumnsToConvert = getSelectedCategoricalColumns(
    state,
    project,
  );
  categoricalColumnsToConvert.forEach(
    (feature: string) =>
      (optionsMappedToNumbersByFeature[feature] = buildOptionNumberKey(
        state,
        feature,
      )),
  );
  store.dispatch(setFeatureNumberKey(optionsMappedToNumbersByFeature));
};

/* Builds an array containing integer values associated with each feature's
  specific option in a given row.
  @param {object} row, entry from the dataset
  {
    labelColumn: option,
    featureColumn1: option,
    featureColumn2: option
    ...
  }
  @return {array}
  */
const extractTrainingExamples = (
  state: RootState,
  project: AilabProject,
  row: DataRow,
): number[] => {
  const exampleValues: number[] = [];
  project.selectedFeatures.forEach((feature: string) =>
    exampleValues.push(
      convertValueForTraining(state, project, row[feature], feature),
    ),
  );
  return exampleValues;
};

const extractTrainingLabel = (
  state: RootState,
  project: AilabProject,
  row: DataRow,
): number | string => {
  const value = row[project.labelColumn!];
  return convertValueForTraining(state, project, value, project.labelColumn!);
};

const prepareTrainingData = (
  store: Store<RootState>,
  project: AilabProject,
): void => {
  const updatedState = store.getState();
  const trainingExamples = updatedState.data.map((row: DataRow) =>
    extractTrainingExamples(updatedState, project, row),
  );
  const trainingLabels = updatedState.data.map((row: DataRow) =>
    extractTrainingLabel(updatedState, project, row),
  );
  /*
  Select X% of examples and corresponding labels from the training set to use for a post-training accuracy calculation.
  */
  const numToReserve = Math.ceil(
    trainingExamples.length * PERCENT_OF_DATASET_FOR_TESTING,
  );
  let accuracyCheckExamples: number[][] = [];
  let accuracyCheckLabels: (number | string)[] = [];
  if (updatedState.reserveLocation === TestDataLocations.END) {
    const index = -1 * numToReserve;
    accuracyCheckExamples = trainingExamples.splice(index);
    accuracyCheckLabels = trainingLabels.splice(index);
  }
  if (updatedState.reserveLocation === TestDataLocations.RANDOM) {
    let numReserved = 0;
    while (numReserved < numToReserve) {
      const randomIndex = getRandomInt(trainingExamples.length - 1);
      accuracyCheckExamples.push(trainingExamples[randomIndex]);
      trainingExamples.splice(randomIndex, 1);
      accuracyCheckLabels.push(trainingLabels[randomIndex]);
      trainingLabels.splice(randomIndex, 1);
      numReserved++;
    }
  }
  store.dispatch(setTrainingExamples(trainingExamples));
  store.dispatch(setTrainingLabels(trainingLabels));
  store.dispatch(setAccuracyCheckExamples(accuracyCheckExamples));
  store.dispatch(setAccuracyCheckLabels(accuracyCheckLabels));
};

const prepareTestData = (
  store: Store<RootState>,
  project: AilabProject,
): number[] => {
  const updatedState = store.getState();
  const testValues: number[] = [];
  project.selectedFeatures.forEach((feature: string) =>
    testValues.push(
      convertValueForTraining(
        updatedState,
        project,
        updatedState.testData[feature],
        feature,
      ),
    ),
  );
  return testValues;
};

const trainingState: {
  trainer?: Trainer;
  store?: Store<RootState>;
  previousResults?: TrainingResults;
} = {};
const init = (store: Store<RootState>, project: AilabProject): void => {
  trainingState.previousResults = getTrainingResults(store.getState());
  trainingState.store = store;
  trainingState.trainer = buildTrainer(store, project);
  buildOptionNumberKeysByFeature(store, project);
  prepareTrainingData(store, project);
};

const onClickTrain = (): TrainingRun | undefined => {
  return trainingState.trainer?.startTraining();
};

const onClickPredict = (
  trainedModel: TrainedModel | undefined,
  project: AilabProject,
): void => {
  const {trainer, store} = trainingState;
  if (trainer && store) {
    trainer.predict(trainedModel, prepareTestData(store, project));
  }
};

// Put back what the store held before the latest init().
const cancel = (): void => {
  const {store, previousResults} = trainingState;
  if (store && previousResults) {
    store.dispatch(restoreTrainingResults(previousResults));
  }
  trainingState.previousResults = undefined;
};

// Discard the trainer held from a prior level/model.
const reset = (): void => {
  trainingState.trainer = undefined;
  trainingState.store = undefined;
  trainingState.previousResults = undefined;
};

export default {
  init,
  onClickTrain,
  onClickPredict,
  cancel,
  reset,
};
