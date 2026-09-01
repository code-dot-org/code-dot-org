import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';
import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import rootReducer, {
  setImportedData,
  setLabelColumn,
  addSelectedFeature,
  setColumnsByDataType,
  setTestData,
  setMode,
  getTrainedModelDataToSave,
} from '../../src/redux';
import train from '../../src/train';
import {
  CANDIDATE_MAX_DEPTHS,
  MIN_NUM_SAMPLES,
} from '../../src/trainers/DecisionTreeTrainer';

// A tree splits `temperature` at one threshold and separates the label
// perfectly, so every candidate depth scores the same and the sweep must keep
// the shallowest.
const separableData = [
  {temperature: '10', rain: '2', play: 'no'},
  {temperature: '12', rain: '8', play: 'no'},
  {temperature: '15', rain: '3', play: 'no'},
  {temperature: '18', rain: '7', play: 'no'},
  {temperature: '20', rain: '1', play: 'no'},
  {temperature: '70', rain: '9', play: 'yes'},
  {temperature: '75', rain: '2', play: 'yes'},
  {temperature: '80', rain: '6', play: 'yes'},
  {temperature: '85', rain: '4', play: 'yes'},
  {temperature: '90', rain: '5', play: 'yes'},
];

/*
  Nine training rows over a three-by-three grid whose label needs more than
  one split. Nodes near the leaves hold fewer rows than the library's default
  minimum leaf size, so the default stops splitting while rows are still
  mixed. This is the measurement behind design Decision 4.
*/
const mixedLeafData = [
  {sun: '1', water: '1', grew: 'no'},
  {sun: '1', water: '2', grew: 'no'},
  {sun: '1', water: '3', grew: 'yes'},
  {sun: '2', water: '1', grew: 'no'},
  {sun: '2', water: '2', grew: 'yes'},
  {sun: '2', water: '3', grew: 'yes'},
  {sun: '3', water: '1', grew: 'yes'},
  {sun: '3', water: '2', grew: 'yes'},
  {sun: '3', water: '3', grew: 'no'},
  {sun: '2', water: '2', grew: 'yes'},
];

// A leaf that holds rows of differing height predicts their mean — a value
// that appears in no row.
const regressionData = [
  {sun: '1', water: '1', height: '2'},
  {sun: '1', water: '1', height: '4'},
  {sun: '5', water: '5', height: '20'},
  {sun: '5', water: '5', height: '22'},
  {sun: '9', water: '9', height: '40'},
  {sun: '9', water: '9', height: '42'},
  {sun: '9', water: '9', height: '41'},
];

function buildStore({data, columnTypes, labelColumn, features, mode}) {
  const store = createStore(rootReducer);
  store.dispatch(setMode(mode ?? {trainer: 'decisionTree'}));
  store.dispatch(setImportedData(data, false));
  Object.entries(columnTypes).forEach(([column, dataType]) =>
    store.dispatch(setColumnsByDataType(column, dataType)),
  );
  store.dispatch(setLabelColumn(labelColumn));
  features.forEach(feature => store.dispatch(addSelectedFeature(feature)));
  return store;
}

const classificationStore = mode =>
  buildStore({
    data: separableData,
    columnTypes: {
      play: ColumnTypes.CATEGORICAL,
      temperature: ColumnTypes.NUMERICAL,
      rain: ColumnTypes.NUMERICAL,
    },
    labelColumn: 'play',
    features: ['temperature', 'rain'],
    mode,
  });

const regressionStore = () =>
  buildStore({
    data: regressionData,
    columnTypes: {
      height: ColumnTypes.NUMERICAL,
      sun: ColumnTypes.NUMERICAL,
      water: ColumnTypes.NUMERICAL,
    },
    labelColumn: 'height',
    features: ['sun', 'water'],
  });

describe('decision tree classification', () => {
  test('trains and predicts', () => {
    const store = classificationStore();
    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData('temperature', 88));
    store.dispatch(setTestData('rain', 5));
    train.onClickPredict(store);

    const state = store.getState();
    expect(state.trainedModel).toBeInstanceOf(DecisionTreeClassifier);
    // featureNumberKey maps no => 0, yes => 1.
    expect(state.prediction).toBe(1);
  });

  test('saves treeClassify, its depth, and no kValue', () => {
    const store = classificationStore();
    train.init(store);
    train.onClickTrain(store);

    const saved = getTrainedModelDataToSave(store.getState());

    expect(saved.selectedTrainer).toBe('treeClassify');
    expect(saved.hyperparameters.minNumSamples).toBe(MIN_NUM_SAMPLES);
    expect(saved).not.toHaveProperty('kValue');
  });

  test('a tie in accuracy keeps the shallowest tree', () => {
    const store = classificationStore();
    train.init(store);
    train.onClickTrain(store);

    const state = store.getState();
    expect(state.accuracyCheckPredictedLabels).toEqual(
      state.accuracyCheckLabels,
    );
    expect(state.hyperparameters.maxDepth).toBe(CANDIDATE_MAX_DEPTHS[0]);
  });

  test('minimum leaf size of 1 classifies rows the library default misses', () => {
    const store = buildStore({
      data: mixedLeafData,
      columnTypes: {
        grew: ColumnTypes.CATEGORICAL,
        sun: ColumnTypes.NUMERICAL,
        water: ColumnTypes.NUMERICAL,
      },
      labelColumn: 'grew',
      features: ['sun', 'water'],
    });
    train.init(store);
    const state = store.getState();
    const labels = state.trainingLabels.map(Number);
    expect(labels).toHaveLength(9);

    const numCorrect = minNumSamples => {
      const model = new DecisionTreeClassifier({maxDepth: 5, minNumSamples});
      model.train(state.trainingExamples, labels);
      return model
        .predict(state.trainingExamples)
        .filter((prediction, index) => prediction === labels[index]).length;
    };

    const libraryDefault = 3;
    expect(numCorrect(MIN_NUM_SAMPLES)).toBeGreaterThan(
      numCorrect(libraryDefault),
    );
  });
});

describe('decision tree regression', () => {
  test('predicts a value that appears in no row', () => {
    const store = regressionStore();
    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData('sun', 1));
    store.dispatch(setTestData('water', 1));
    train.onClickPredict(store);

    const state = store.getState();
    const observedHeights = state.data.map(row => Number(row.height));

    expect(state.trainedModel).toBeInstanceOf(DecisionTreeRegression);
    expect(state.prediction).toBe(12);
    expect(observedHeights).not.toContain(state.prediction);
    expect(state.prediction).toBeGreaterThan(Math.min(...observedHeights));
    expect(state.prediction).toBeLessThan(Math.max(...observedHeights));
  });

  test('saves treeRegress', () => {
    const store = regressionStore();
    train.init(store);
    train.onClickTrain(store);

    expect(getTrainedModelDataToSave(store.getState()).selectedTrainer).toBe(
      'treeRegress',
    );
  });
});

describe('decision tree model round-trip', () => {
  test.each([
    ['classification', classificationStore, DecisionTreeClassifier],
    ['regression', regressionStore, DecisionTreeRegression],
  ])('%s model reloads and predicts identically', (_name, makeStore, Model) => {
    const store = makeStore();
    train.init(store);
    train.onClickTrain(store);

    const state = store.getState();
    const examples = state.trainingExamples;

    const serialized = JSON.parse(
      JSON.stringify(getTrainedModelDataToSave(state).trainedModel),
    );

    expect(Model.load(serialized).predict(examples)).toEqual(
      state.trainedModel.predict(examples),
    );
  });
});
