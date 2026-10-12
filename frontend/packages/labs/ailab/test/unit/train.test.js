import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import {getConvertedPredictedLabel} from '../../src/helpers/valueConversion';
import rootReducer, {
  getTrainingResults,
  setImportedData,
  setColumnsByDataType,
  setTestData,
} from '../../src/redux';
import train from '../../src/train';
import {initialProject} from '../../src/types';

import {levelProject, levelStore} from './levelStore';

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
    const project = {
      ...initialProject,
      labelColumn: 'cost',
      selectedFeatures: ['temperature', 'rain'],
    };

    train.init(store, project);
    const {trainedModel} = train.onClickTrain();

    store.dispatch(setTestData('temperature', 10));
    store.dispatch(setTestData('rain', 1010));

    train.onClickPredict(trainedModel);

    const predictedValue = getConvertedPredictedLabel(
      store.getState(),
      project,
    );

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
    const project = {
      ...initialProject,
      labelColumn: 'color',
      selectedFeatures: ['flavor', 'texture'],
    };

    train.init(store, project);
    const {trainedModel} = train.onClickTrain();

    store.dispatch(setTestData('flavor', 'sweet'));
    store.dispatch(setTestData('texture', 'crunchy'));

    train.onClickPredict(trainedModel);

    const predictedLabel = getConvertedPredictedLabel(
      store.getState(),
      project,
    );

    expect(predictedLabel).toBe('green');
  });
});

// Cancel undoes only the Redux half of a run; ProjectContext and
// TrainingDataContext undo theirs, and useTrainingRun drives all three.
describe('train.cancel', () => {
  const trainOnce = (store, project) => {
    train.init(store, project);
    train.onClickTrain();
  };

  test('puts back the results from before the cancelled run', () => {
    const store = levelStore({});
    trainOnce(store, levelProject());
    const before = getTrainingResults(store.getState());

    trainOnce(store, levelProject());

    train.cancel();
    expect(getTrainingResults(store.getState())).toEqual(before);
  });
});
