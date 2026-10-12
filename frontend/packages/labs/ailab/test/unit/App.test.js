import {act} from '@testing-library/react';
import {createElement} from 'react';

import App from '../../src/App';
import I18n from '../../src/i18n';
import {resetState, setMode} from '../../src/redux';

import {levelStore} from './levelStore';
import {renderWithProviders, trainModel} from './renderWithProviders';

function renderApp(mode) {
  const store = levelStore(mode);
  const onTrained = vi.fn();
  renderWithProviders(
    createElement(App, {
      onContinue: () => {},
      saveTrainedModel: () => {},
      onTrained,
    }),
    {store},
  );
  return {store, onTrained};
}

function runTraining(store) {
  act(() => {
    trainModel(store);
  });
}

describe('onTrained', () => {
  beforeEach(() => I18n.initI18n());

  test('is not called before training', () => {
    const {onTrained} = renderApp({});
    expect(onTrained).not.toHaveBeenCalled();
  });

  test('receives the accuracy of every training run', () => {
    const {store, onTrained} = renderApp({trainer: 'decisionTree'});
    runTraining(store);
    runTraining(store);
    expect(onTrained.mock.calls).toEqual([[100], [100]]);
  });

  test('is not called when the next level loads', () => {
    const {store, onTrained} = renderApp({trainer: 'decisionTree'});
    runTraining(store);
    act(() => {
      store.dispatch(resetState());
      store.dispatch(setMode({}));
    });
    expect(onTrained).toHaveBeenCalledTimes(1);
  });
});
