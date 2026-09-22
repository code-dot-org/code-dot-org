/*
  What a training metric carries. The trainer id is here so a rollout can tell
  decision tree training from KNN training, and so the event can be joined to
  the saved model, which records the same id.

  These train for real rather than calling `logMetric` directly, because the
  metric is emitted from inside training and its accuracy is only meaningful
  once a model exists.
*/
import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import {setMetricsLogger} from '../../src/helpers/metrics';
import rootReducer, {
  addSelectedFeature,
  setColumnsByDataType,
  setImportedData,
  setLabelColumn,
  setMode,
} from '../../src/redux';
import train from '../../src/train';
import {buildTrainer} from '../../src/trainers';

// `legs` fixes `animal`, so training reaches 100% and the metric is stable.
const ANIMALS = [
  {animal: 'bird', legs: '2'},
  {animal: 'dog', legs: '4'},
  {animal: 'snake', legs: '0'},
  {animal: 'bird', legs: '2'},
  {animal: 'dog', legs: '4'},
  {animal: 'snake', legs: '0'},
  {animal: 'bird', legs: '2'},
  {animal: 'dog', legs: '4'},
  {animal: 'snake', legs: '0'},
  {animal: 'dog', legs: '4'},
];

// Trains a level and returns the metrics it emitted while doing so.
function trainAndCapture(mode) {
  const store = createStore(rootReducer);
  const calls = [];

  setMetricsLogger((action, details) => calls.push({action, details}));

  store.dispatch(setMode(mode));
  store.dispatch(setImportedData(ANIMALS, false));
  store.dispatch(setColumnsByDataType('animal', ColumnTypes.CATEGORICAL));
  store.dispatch(setColumnsByDataType('legs', ColumnTypes.NUMERICAL));
  store.dispatch(setLabelColumn('animal'));
  store.dispatch(addSelectedFeature('legs'));

  train.reset();
  train.init(store);
  buildTrainer(store).startTraining();

  return calls;
}

describe('the train-model metric', () => {
  test('names the trainer a decision tree level used', () => {
    const [call] = trainAndCapture({trainer: 'decisionTree'});

    expect(call.action).toBe('train-model');
    expect(call.details.trainer).toBe('treeClassify');
  });

  test('names the trainer a knn level used', () => {
    expect(trainAndCapture(undefined)[0].details.trainer).toBe('knnClassify');
  });

  test('carries the dataset and column details alongside it', () => {
    const [{details}] = trainAndCapture({trainer: 'decisionTree'});

    expect(details).toEqual({
      userUploaded: false,
      datasetName: undefined,
      features: ['legs'],
      label: 'animal',
      accuracy: '100.00',
      trainer: 'treeClassify',
    });
  });
});
