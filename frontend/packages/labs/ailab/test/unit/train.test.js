import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import {getConvertedPredictedLabel} from '../../src/helpers/valueConversion';
import rootReducer, {
  getTrainingResults,
  setImportedData,
  setLabelColumn,
  addSelectedFeature,
  removeSelectedFeature,
  setColumnsByDataType,
  setTestData,
} from '../../src/redux';
import train from '../../src/train';

import {levelStore} from './levelStore';

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
    train.onClickTrain();

    store.dispatch(setTestData('temperature', 10));
    store.dispatch(setTestData('rain', 1010));

    train.onClickPredict();

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
    train.onClickTrain();

    store.dispatch(setTestData('flavor', 'sweet'));
    store.dispatch(setTestData('texture', 'crunchy'));

    train.onClickPredict();

    const predictedLabel = getConvertedPredictedLabel(store.getState());

    expect(predictedLabel).toBe('green');
  });
});

describe('train.cancel', () => {
  const trainOnce = store => {
    train.init(store);
    train.onClickTrain();
  };

  test('puts back the results from before the cancelled run', () => {
    const store = levelStore({});
    trainOnce(store);
    const before = getTrainingResults(store.getState());

    store.dispatch(removeSelectedFeature('legs'));
    store.dispatch(addSelectedFeature('legs'));
    trainOnce(store);
    expect(store.getState().historicResults).toHaveLength(2);

    train.cancel();
    expect(getTrainingResults(store.getState())).toEqual(before);
  });

  test('leaves the label and features as chosen', () => {
    const store = levelStore({});
    trainOnce(store);
    train.cancel();

    const state = store.getState();
    expect(state.labelColumn).toBe('animal');
    expect(state.selectedFeatures).toEqual(['legs']);
    expect(state.historicResults).toEqual([]);
    expect(state.trainedModel).toBeUndefined();
  });
});
