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

    train.onClickPredict(trainedModel, project);

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

    train.onClickPredict(trainedModel, project);

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

  /*
    A cancelled run restores the model trained before it, so a prediction has
    to be built from that model's columns. Reusing the cancelled run's columns
    feeds it values for features it never saw.
  */
  test('predicts with the restored model, not the cancelled run', () => {
    const store = createStore(rootReducer);
    const data = [
      {animal: 'bird', legs: '2', tail: 'yes'},
      {animal: 'dog', legs: '4', tail: 'yes'},
      {animal: 'snake', legs: '0', tail: 'no'},
      {animal: 'bird', legs: '2', tail: 'no'},
      {animal: 'dog', legs: '4', tail: 'no'},
      {animal: 'snake', legs: '0', tail: 'yes'},
    ];
    store.dispatch(setImportedData(data, false));
    store.dispatch(setColumnsByDataType('animal', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('legs', ColumnTypes.NUMERICAL));
    store.dispatch(setColumnsByDataType('tail', ColumnTypes.CATEGORICAL));

    const onLegs = {
      ...initialProject,
      labelColumn: 'animal',
      selectedFeatures: ['legs'],
    };
    const onLegsAndTail = {...onLegs, selectedFeatures: ['legs', 'tail']};

    train.init(store, onLegs);
    const {trainedModel} = train.onClickTrain();
    store.dispatch(setTestData('legs', 0));
    train.onClickPredict(trainedModel, onLegs);
    const predicted = getConvertedPredictedLabel(store.getState(), onLegs);

    // A second run on different columns, which the student then cancels.
    train.init(store, onLegsAndTail);
    train.onClickTrain();
    train.cancel();

    train.onClickPredict(trainedModel, onLegs);

    expect(getConvertedPredictedLabel(store.getState(), onLegs)).toBe(
      predicted,
    );
  });
});

describe('the accuracy-check split', () => {
  // How train.init divides a dataset of this many rows.
  const splitOf = rowCount => {
    const store = createStore(rootReducer);
    const rows = Array.from({length: rowCount}, (_unused, index) => ({
      animal: index % 2 ? 'bird' : 'dog',
      legs: String(index),
    }));

    store.dispatch(setImportedData(rows, false));
    store.dispatch(setColumnsByDataType('animal', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('legs', ColumnTypes.NUMERICAL));
    train.init(store, {
      ...initialProject,
      labelColumn: 'animal',
      selectedFeatures: ['legs'],
    });

    const {accuracyCheckExamples, trainingExamples} = store.getState();
    return {
      heldBack: accuracyCheckExamples.length,
      trainedOn: trainingExamples.length,
    };
  };

  test('rounds the held-back count up', () => {
    expect(splitOf(21)).toEqual({heldBack: 3, trainedOn: 18});
  });

  // Rounding to nearest would leave a small dataset nothing to grade against.
  test('holds a row back even when a tenth of the dataset is under one', () => {
    expect(splitOf(4)).toEqual({heldBack: 1, trainedOn: 3});
  });
});
