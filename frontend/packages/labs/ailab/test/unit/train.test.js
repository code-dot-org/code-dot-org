import {DecisionTreeClassifier} from 'ml-cart';
import KNN from 'ml-knn';
import {createStore} from 'redux';
import {vi} from 'vitest';

import {ColumnTypes} from '../../src/constants';
import {getConvertedPredictedLabel} from '../../src/helpers/valueConversion';
import rootReducer, {
  setImportedData,
  setLabelColumn,
  addSelectedFeature,
  setColumnsByDataType,
  setTestData,
  setMode,
} from '../../src/redux';
import train from '../../src/train';

describe('train functions', () => {
  test('train and predict with numerical data', async () => {
    const store = createStore(rootReducer);

    const data = [
      {temperature: '0', cost: '20', rain: '1000'},
      {temperature: '50', cost: '25', rain: '1010'},
      {temperature: '100', cost: '30', rain: '1020'},
      {temperature: '150', cost: '35', rain: '1030'},
    ];

    store.dispatch(setImportedData(data, false));
    store.dispatch(setColumnsByDataType('cost', ColumnTypes.NUMERICAL));
    store.dispatch(setColumnsByDataType('rain', ColumnTypes.NUMERICAL));
    store.dispatch(setColumnsByDataType('temperature', ColumnTypes.NUMERICAL));
    store.dispatch(setLabelColumn('cost'));
    store.dispatch(addSelectedFeature('temperature'));
    store.dispatch(addSelectedFeature('rain'));

    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData('temperature', 10));
    store.dispatch(setTestData('rain', 1010));

    train.onClickPredict(store);

    const predictedValue = getConvertedPredictedLabel(store.getState());

    expect(predictedValue).toBe(20);
  });

  test('train and predict with categorical data', async () => {
    const store = createStore(rootReducer);

    const data = [
      {color: 'blue', flavor: 'sour', texture: 'crunchy'},
      {color: 'green', flavor: 'sweet', texture: 'crunchy'},
      {color: 'green', flavor: 'sweet', texture: 'crunchy'},
      {color: 'yellow', flavor: 'sweet', texture: 'crunchy'},
      {color: 'blue', flavor: 'sweet', texture: 'soft'},
    ];

    store.dispatch(setImportedData(data, false));
    store.dispatch(setColumnsByDataType('color', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('flavor', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('texture', ColumnTypes.CATEGORICAL));
    store.dispatch(setLabelColumn('color'));
    store.dispatch(addSelectedFeature('flavor'));
    store.dispatch(addSelectedFeature('texture'));

    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData('flavor', 'sweet'));
    store.dispatch(setTestData('texture', 'crunchy'));

    train.onClickPredict(store);

    const predictedLabel = getConvertedPredictedLabel(store.getState());

    expect(predictedLabel).toBe('green');
  });
});

describe('trainer selection from the level mode', () => {
  const data = [
    {sun: '1', water: '1', grew: 'no'},
    {sun: '2', water: '2', grew: 'no'},
    {sun: '3', water: '3', grew: 'no'},
    {sun: '8', water: '8', grew: 'yes'},
    {sun: '9', water: '9', grew: 'yes'},
    {sun: '9', water: '8', grew: 'yes'},
  ];

  const trainWithMode = mode => {
    const store = createStore(rootReducer);
    store.dispatch(setMode(mode));
    store.dispatch(setImportedData(data, false));
    store.dispatch(setColumnsByDataType('grew', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('sun', ColumnTypes.NUMERICAL));
    store.dispatch(setColumnsByDataType('water', ColumnTypes.NUMERICAL));
    store.dispatch(setLabelColumn('grew'));
    store.dispatch(addSelectedFeature('sun'));
    store.dispatch(addSelectedFeature('water'));

    train.init(store);
    train.onClickTrain(store);
    return store.getState();
  };

  test('"decisionTree" builds a decision tree trainer', () => {
    expect(trainWithMode({trainer: 'decisionTree'}).trainedModel).toBeInstanceOf(
      DecisionTreeClassifier,
    );
  });

  test('an absent trainer field builds a KNN trainer', () => {
    expect(trainWithMode({}).trainedModel).toBeInstanceOf(KNN);
    expect(trainWithMode(undefined).trainedModel).toBeInstanceOf(KNN);
  });

  test('an unknown trainer warns and falls back to KNN', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const state = trainWithMode({trainer: 'desicionTree'});

    expect(state.trainedModel).toBeInstanceOf(KNN);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('desicionTree'),
    );

    warn.mockRestore();
  });
});
