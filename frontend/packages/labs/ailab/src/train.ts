/* Generic machine learning handlers that route to the selected trainer. */

import {Store} from 'redux';
import KNNTrainer from './trainers/KNNTrainer';

import {buildOptionNumberKey} from './helpers/columnDetails';
import {
  RootState,
  setFeatureNumberKey,
  setTrainingExamples,
  setTrainingLabels,
  setAccuracyCheckExamples,
  setAccuracyCheckLabels,
} from './redux';
import {DataRow} from './types';
import {getSelectedCategoricalColumns} from './selectors';
import {TestDataLocations, PERCENT_OF_DATASET_FOR_TESTING} from './constants';
import {getRandomInt} from './helpers/utils';
import {convertValueForTraining} from './helpers/valueConversion';

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

const buildOptionNumberKeysByFeature = (store: Store<RootState>): void => {
  const state = store.getState();
  const optionsMappedToNumbersByFeature: Record<
    string,
    Record<string, number>
  > = {};
  const categoricalColumnsToConvert = getSelectedCategoricalColumns(state);
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
const extractTrainingExamples = (state: RootState, row: DataRow): number[] => {
  const exampleValues: number[] = [];
  state.selectedFeatures.forEach((feature: string) =>
    exampleValues.push(convertValueForTraining(state, row[feature], feature)),
  );
  return exampleValues;
};

const extractTrainingLabel = (
  state: RootState,
  row: DataRow,
): number | string => {
  const value = row[state.labelColumn!];
  return convertValueForTraining(state, value, state.labelColumn!);
};

const prepareTrainingData = (store: Store<RootState>): void => {
  const updatedState = store.getState();
  const trainingExamples = updatedState.data.map((row: DataRow) =>
    extractTrainingExamples(updatedState, row),
  );
  const trainingLabels = updatedState.data.map((row: DataRow) =>
    extractTrainingLabel(updatedState, row),
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

const prepareTestData = (store: Store<RootState>): number[] => {
  const updatedState = store.getState();
  const testValues: number[] = [];
  updatedState.selectedFeatures.forEach((feature: string) =>
    testValues.push(
      convertValueForTraining(
        updatedState,
        updatedState.testData[feature],
        feature,
      ),
    ),
  );
  return testValues;
};

const trainingState: {trainer?: KNNTrainer} = {};
const init = (store: Store<RootState>): void => {
  trainingState.trainer = new KNNTrainer(store);
  buildOptionNumberKeysByFeature(store);
  prepareTrainingData(store);
};

const onClickTrain = (store: Store<RootState>): void => {
  trainingState.trainer?.startTraining(store);
};

const onClickPredict = (store: Store<RootState>): void => {
  const testValues = prepareTestData(store);
  trainingState.trainer?.predict(testValues);
};

export default {
  init,
  onClickTrain,
  onClickPredict,
};
