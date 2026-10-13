import {act} from '@testing-library/react';
import {createElement} from 'react';

import App from '../../src/App';
import I18n from '../../src/i18n';
import {resetState, setMode} from '../../src/redux';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

function renderApp(mode) {
  const store = levelStore(mode);
  const project = levelProject();
  const onTrained = vi.fn();
  const {trainModel} = renderWithProviders(
    createElement(App, {
      onContinue: () => {},
      saveTrainedModel: () => {},
      onTrained,
    }),
    {store, project},
  );
  return {store, onTrained, trainModel};
}

describe('onTrained', () => {
  beforeEach(() => I18n.initI18n());

  test('is not called before training', () => {
    const {onTrained} = renderApp({});
    expect(onTrained).not.toHaveBeenCalled();
  });

  test('receives the accuracy of every training run', () => {
    const {onTrained, trainModel} = renderApp({trainer: 'decisionTree'});
    trainModel();
    trainModel();
    expect(onTrained.mock.calls).toEqual([[100], [100]]);
  });

  test('is not called when the next level loads', () => {
    const {store, onTrained, trainModel} = renderApp({trainer: 'decisionTree'});
    trainModel();
    act(() => {
      store.dispatch(resetState());
      store.dispatch(setMode({}));
    });
    expect(onTrained).toHaveBeenCalledTimes(1);
  });
});
