/* Generic machine learning handlers that route to the selected trainer. */

import type {Store} from 'redux';

import {TestDataLocations, PERCENT_OF_DATASET_FOR_TESTING} from './constants';
import {buildOptionNumberKey} from './helpers/columnDetails';
import {splitRowIndices} from './helpers/trainingSplit';
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
  Prepares the training and accuracy check datasets.
  Data is stored in redux.
*/
const prepareTrainingData = (
  store: Store<RootState>,
  project: AilabProject,
  accuracyCheckRowIndices: number[],
): void => {
  const state = store.getState();
  const {trained, test} = splitRowIndices(
    state.data.length,
    accuracyCheckRowIndices,
  );
  const examples = (rows: number[]) =>
    rows.map(row => extractTrainingExamples(state, project, state.data[row]));
  const labels = (rows: number[]) =>
    rows.map(row => extractTrainingLabel(state, project, state.data[row]));

  store.dispatch(setTrainingExamples(examples(trained)));
  store.dispatch(setTrainingLabels(labels(trained)));
  store.dispatch(setAccuracyCheckExamples(examples(test)));
  store.dispatch(setAccuracyCheckLabels(labels(test)));
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

// A run the student started, without a predetermined split.
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
  Whether a saved split still describes this dataset: every index names a row,
  and some rows are left over to train on. If the rowCount has changed, 
  the split may no longer be valid.
*/
const describesDataset = (
  accuracyCheckRowIndices: number[],
  rowCount: number,
): boolean => {
  const reserved = new Set(accuracyCheckRowIndices);
  return (
    reserved.size > 0 &&
    reserved.size < rowCount &&
    [...reserved].every(
      index => Number.isInteger(index) && index >= 0 && index < rowCount,
    )
  );
};

/*
  Rebuilds the model a saved project describes, on the split it was graded
  against. Not a run the student can cancel, so it leaves previousResults alone.
*/
const refit = (
  store: Store<RootState>,
  project: AilabProject,
): TrainingRun | undefined => {
  const {hyperparameters, accuracyCheckRowIndices} = project;
  if (
    !hyperparameters ||
    !accuracyCheckRowIndices ||
    !describesDataset(accuracyCheckRowIndices, store.getState().data.length)
  ) {
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
