import KNN from 'ml-knn';
import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import rootReducer, {
  setImportedData,
  setLabelColumn,
  addSelectedFeature,
  setColumnsByDataType,
  setTestData,
  getTrainedModelDataToSave,
} from '../../src/redux';
import train from '../../src/train';

/*
  Characterization tests. They record what a KNN level saves and predicts
  before the trainer interface exists, so the refactor that follows is
  reviewed against them. Every value here was measured, not chosen.
*/

// Twelve rows, so `possibleKValues` takes the sweep branch rather than the
// single-candidate branch it takes for ten rows or fewer.
const classificationData = [
  {color: 'blue', flavor: 'sour', texture: 'crunchy'},
  {color: 'green', flavor: 'sweet', texture: 'crunchy'},
  {color: 'green', flavor: 'sweet', texture: 'crunchy'},
  {color: 'yellow', flavor: 'sweet', texture: 'crunchy'},
  {color: 'blue', flavor: 'sweet', texture: 'soft'},
  {color: 'yellow', flavor: 'sour', texture: 'soft'},
  {color: 'blue', flavor: 'sour', texture: 'soft'},
  {color: 'green', flavor: 'sweet', texture: 'soft'},
  {color: 'yellow', flavor: 'sweet', texture: 'crunchy'},
  {color: 'blue', flavor: 'sour', texture: 'crunchy'},
  {color: 'green', flavor: 'sweet', texture: 'crunchy'},
  {color: 'yellow', flavor: 'sour', texture: 'crunchy'},
];

const regressionData = [
  {temperature: '0', cost: '20', rain: '1000'},
  {temperature: '50', cost: '25', rain: '1010'},
  {temperature: '100', cost: '30', rain: '1020'},
  {temperature: '150', cost: '35', rain: '1030'},
  {temperature: '200', cost: '40', rain: '1040'},
  {temperature: '250', cost: '45', rain: '1050'},
];

function buildStore({data, columnTypes, labelColumn, features}) {
  const store = createStore(rootReducer);
  store.dispatch(setImportedData(data, false));
  Object.entries(columnTypes).forEach(([column, dataType]) =>
    store.dispatch(setColumnsByDataType(column, dataType)),
  );
  store.dispatch(setLabelColumn(labelColumn));
  features.forEach(feature => store.dispatch(addSelectedFeature(feature)));
  return store;
}

const classificationStore = () =>
  buildStore({
    data: classificationData,
    columnTypes: {
      color: ColumnTypes.CATEGORICAL,
      flavor: ColumnTypes.CATEGORICAL,
      texture: ColumnTypes.CATEGORICAL,
    },
    labelColumn: 'color',
    features: ['flavor', 'texture'],
  });

const regressionStore = () =>
  buildStore({
    data: regressionData,
    columnTypes: {
      cost: ColumnTypes.NUMERICAL,
      rain: ColumnTypes.NUMERICAL,
      temperature: ColumnTypes.NUMERICAL,
    },
    labelColumn: 'cost',
    features: ['temperature', 'rain'],
  });

describe('KNN saved model data', () => {
  test('classification level saves knnClassify and its k', () => {
    const store = classificationStore();
    train.init(store);
    train.onClickTrain(store);

    const saved = getTrainedModelDataToSave(store.getState());

    expect(saved.selectedTrainer).toBe('knnClassify');
    expect(saved.kValue).toBe(5);
    expect(saved.summaryStat).toEqual({
      type: 'classification',
      stat: '50.00',
    });
    expect(saved.featureNumberKey).toEqual({
      color: {blue: 0, green: 1, yellow: 2},
      flavor: {sour: 0, sweet: 1},
      texture: {crunchy: 0, soft: 1},
    });
  });

  test('regression level saves knnRegress and its k', () => {
    const store = regressionStore();
    train.init(store);
    train.onClickTrain(store);

    const saved = getTrainedModelDataToSave(store.getState());

    expect(saved.selectedTrainer).toBe('knnRegress');
    expect(saved.kValue).toBe(1);
    expect(saved.summaryStat).toEqual({type: 'regression', stat: '0.00'});
  });
});

describe('KNN prediction', () => {
  test('classification prediction is unchanged', () => {
    const store = classificationStore();
    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData('flavor', 'sweet'));
    store.dispatch(setTestData('texture', 'crunchy'));
    train.onClickPredict(store);

    expect(store.getState().prediction).toBe(1);
  });

  test('regression prediction is unchanged', () => {
    const store = regressionStore();
    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData('temperature', 10));
    store.dispatch(setTestData('rain', 1010));
    train.onClickPredict(store);

    expect(store.getState().prediction).toBe(20);
  });
});

describe('KNN model round-trip', () => {
  test('a reloaded model predicts identically', () => {
    const store = classificationStore();
    train.init(store);
    train.onClickTrain(store);

    const state = store.getState();
    const examples = state.trainingExamples;

    const serialized = JSON.parse(
      JSON.stringify(getTrainedModelDataToSave(state).trainedModel),
    );
    const reloaded = KNN.load(serialized);

    expect(reloaded.predict(examples)).toEqual(
      state.trainedModel.predict(examples),
    );
  });
});
