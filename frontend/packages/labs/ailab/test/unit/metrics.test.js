/*
  The trainer id is on the metric so a rollout can tell decision tree training
  from KNN training, and so the event can be joined to the saved model.
*/
import {setMetricsLogger} from '../../src/helpers/metrics';
import train from '../../src/train';

import {levelStore} from './levelStore';

function trainAndCapture(mode) {
  const calls = [];
  setMetricsLogger((action, details) => calls.push({action, details}));

  train.init(levelStore(mode));
  train.onClickTrain();

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
