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
import type {Trainer, TrainerOutput, TrainingRun} from './trainers/types';
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

/*
  Which rows a run holds back to grade itself on.
*/
const reserveRowIndices = (rowCount: number, location: string): number[] => {
  const numToReserve = Math.ceil(rowCount * PERCENT_OF_DATASET_FOR_TESTING);

  if (location === TestDataLocations.RANDOM) {
    const reserved = new Set<number>();
    while (reserved.size < numToReserve && reserved.size < rowCount) {
      reserved.add(getRandomInt(rowCount));
    }
    return [...reserved].sort((a, b) => a - b);
  }

  // If the location is not random, reserve the last numToReserve rows.
  const firstReserved = Math.max(0, rowCount - numToReserve);
  return Array.from(
    {length: rowCount - firstReserved},
    (_unused, offset) => firstReserved + offset,
  );
};

/*
  Turns the dataset into the numbers a trainer works with, split into the rows
  it trains on and the rows it is graded against.
*/
const prepareTrainingData = (
  store: Store<RootState>,
  project: AilabProject,
  accuracyCheckRowIndices: number[],
): void => {
  const state = store.getState();
  const reserved = new Set(accuracyCheckRowIndices);

  const trainingExamples: number[][] = [];
  const trainingLabels: (number | string)[] = [];
  const accuracyCheckExamples: number[][] = [];
  const accuracyCheckLabels: (number | string)[] = [];

  state.data.forEach((row: DataRow, index: number) => {
    const example = extractTrainingExamples(state, project, row);
    const label = extractTrainingLabel(state, project, row);
    if (reserved.has(index)) {
      accuracyCheckExamples.push(example);
      accuracyCheckLabels.push(label);
    } else {
      trainingExamples.push(example);
      trainingLabels.push(label);
    }
  });

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
  accuracyCheckRowIndices?: number[];
  previousResults?: TrainingResults;
} = {};

// Everything a run needs in place before a trainer can look at it.
const prepare = (
  store: Store<RootState>,
  project: AilabProject,
  accuracyCheckRowIndices: number[],
): void => {
  trainingState.store = store;
  trainingState.trainer = buildTrainer(store, project);
  trainingState.accuracyCheckRowIndices = accuracyCheckRowIndices;
  buildOptionNumberKeysByFeature(store, project);
  prepareTrainingData(store, project, accuracyCheckRowIndices);
};

// A run the student started, on a split chosen fresh.
const init = (store: Store<RootState>, project: AilabProject): void => {
  const state = store.getState();
  trainingState.previousResults = getTrainingResults(state);
  prepare(
    store,
    project,
    reserveRowIndices(state.data.length, state.reserveLocation),
  );
};

const describeRun = (run?: TrainerOutput): TrainingRun | undefined =>
  run && {
    ...run,
    accuracyCheckRowIndices: trainingState.accuracyCheckRowIndices ?? [],
  };

const onClickTrain = (): TrainingRun | undefined =>
  describeRun(trainingState.trainer?.startTraining());

/*
  Rebuilds the model a saved project describes, on the split it was graded
  against. Not a run the student can cancel, so it leaves previousResults alone.
*/
const refit = (
  store: Store<RootState>,
  project: AilabProject,
): TrainingRun | undefined => {
  const {hyperparameters, accuracyCheckRowIndices} = project;
  if (!hyperparameters || !accuracyCheckRowIndices) {
    return undefined;
  }
  prepare(store, project, accuracyCheckRowIndices);
  return describeRun(trainingState.trainer?.rebuild(hyperparameters));
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
  trainingState.accuracyCheckRowIndices = undefined;
  trainingState.previousResults = undefined;
};

export default {
  init,
  refit,
  onClickTrain,
  onClickPredict,
  cancel,
  reset,
};
