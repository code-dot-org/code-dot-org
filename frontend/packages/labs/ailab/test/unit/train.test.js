import {createStore} from 'redux';

import {Algorithms, ColumnTypes} from '../../src/constants';
import {getConvertedPredictedLabel} from '../../src/helpers/valueConversion';
import rootReducer, {
  setImportedData,
  setLabelColumn,
  addSelectedFeature,
  setColumnsByDataType,
  setTestData,
  setSelectedAlgorithm,
} from '../../src/redux';
import train from '../../src/train';
import {ID3Model} from '../../src/trainers/ID3Trainer';

describe('train functions', () => {
  test('train and predict with numerical data', async () => {
    const store = createStore(rootReducer);

    const data = [
      {temperature: '0', cost: '20', rain: '1000'},
      {temperature: '50', cost: '25', rain: '1010'},
      {temperature: '100', cost: '30', rain: '1020'},
      {temperature: '150', cost: '35', rain: '1030'},
    ];

    store.dispatch(setSelectedAlgorithm(Algorithms.KNN));
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

    store.dispatch(setSelectedAlgorithm(Algorithms.KNN));
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

  test('train and predict with ID3 and categorical data', async () => {
    const store = createStore(rootReducer);

    const data = [
      {color: 'blue', flavor: 'sour', texture: 'crunchy'},
      {color: 'green', flavor: 'sweet', texture: 'crunchy'},
      {color: 'green', flavor: 'sweet', texture: 'crunchy'},
      {color: 'yellow', flavor: 'sweet', texture: 'soft'},
      {color: 'blue', flavor: 'sour', texture: 'soft'},
    ];

    store.dispatch(setSelectedAlgorithm(Algorithms.DECISION_TREE));
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

  test('train and predict with ID3 and numerical data', async () => {
    const store = createStore(rootReducer);

    const data = [
      {temperature: '0', cost: '10'},
      {temperature: '25', cost: '10'},
      {temperature: '75', cost: '20'},
      {temperature: '100', cost: '20'},
    ];

    store.dispatch(setSelectedAlgorithm(Algorithms.DECISION_TREE));
    store.dispatch(setImportedData(data, false));
    store.dispatch(setColumnsByDataType('cost', ColumnTypes.NUMERICAL));
    store.dispatch(setColumnsByDataType('temperature', ColumnTypes.NUMERICAL));
    store.dispatch(setLabelColumn('cost'));
    store.dispatch(addSelectedFeature('temperature'));

    train.init(store);
    train.onClickTrain(store);

    store.dispatch(setTestData('temperature', 90));

    train.onClickPredict(store);

    const predictedValue = getConvertedPredictedLabel(store.getState());

    expect(predictedValue).toBe(20);
  });

  test('ID3 stores training metadata for decision tree visualization', async () => {
    const model = new ID3Model(
      [[0], [0], [1], [1]],
      ['no', 'no', 'yes', 'yes'],
      [ColumnTypes.CATEGORICAL],
    );

    const root = model.toJSON().root;

    expect(root).toMatchObject({
      type: 'decision',
      sampleCount: 4,
      labelCounts: {no: 2, yes: 2},
    });
    expect(root.impurityReduction).toBeCloseTo(1);
    expect(root.children[0]).toMatchObject({
      type: 'leaf',
      prediction: 'no',
      sampleCount: 2,
      labelCounts: {no: 2},
    });
    expect(root.children[1]).toMatchObject({
      type: 'leaf',
      prediction: 'yes',
      sampleCount: 2,
      labelCounts: {yes: 2},
    });
  });
});
