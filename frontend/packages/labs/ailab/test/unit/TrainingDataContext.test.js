import {act, render} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import rootReducer, {resetState} from '../../src/redux';
import {
  TrainingDataProvider,
  useTrainingData,
} from '../../src/TrainingDataContext';

const MODEL = {predict: () => [], toJSON: () => ({})};
const OTHER_MODEL = {predict: () => [], toJSON: () => ({})};

function renderContext() {
  const store = createStore(rootReducer);
  let trainingData;
  const Probe = () => {
    trainingData = useTrainingData();
    return null;
  };

  render(
    createElement(
      Provider,
      {store},
      createElement(TrainingDataProvider, null, createElement(Probe)),
    ),
  );

  return {store, trainingData: () => trainingData};
}

describe('TrainingDataContext', () => {
  test('starts without a model', () => {
    const {trainingData} = renderContext();
    expect(trainingData().trainedModel).toBeUndefined();
  });

  test('holds the model it is given', () => {
    const {trainingData} = renderContext();

    act(() => trainingData().setTrainedModel(MODEL));

    expect(trainingData().trainedModel).toBe(MODEL);
  });

  test('a restore puts back the model snapshotted before the run', () => {
    const {trainingData} = renderContext();
    act(() => trainingData().setTrainedModel(MODEL));

    act(() => trainingData().snapshotTrainedModel());
    act(() => trainingData().setTrainedModel(OTHER_MODEL));
    expect(trainingData().trainedModel).toBe(OTHER_MODEL);

    act(() => trainingData().restoreTrainedModel());
    expect(trainingData().trainedModel).toBe(MODEL);
  });

  test('a first run restores to no model at all', () => {
    const {trainingData} = renderContext();

    act(() => trainingData().snapshotTrainedModel());
    act(() => trainingData().setTrainedModel(MODEL));
    act(() => trainingData().restoreTrainedModel());

    expect(trainingData().trainedModel).toBeUndefined();
  });

  // Dispatched by loadLevel(), and by choosing or uploading a dataset.
  test('a state reset clears the model and the snapshot', () => {
    const {store, trainingData} = renderContext();
    act(() => trainingData().snapshotTrainedModel());
    act(() => trainingData().setTrainedModel(MODEL));

    act(() => {
      store.dispatch(resetState());
    });
    expect(trainingData().trainedModel).toBeUndefined();

    act(() => trainingData().restoreTrainedModel());
    expect(trainingData().trainedModel).toBeUndefined();
  });
});
