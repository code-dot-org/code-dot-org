import {ThemeProvider} from '@mui/material/styles';
import {act, render} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import App from '../../src/App';
import I18n from '../../src/i18n';
import {resetState, setMode} from '../../src/redux';
import train from '../../src/train';

import {levelStore} from './levelStore';

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    disconnect() {}
  },
);

function renderApp(mode) {
  const store = levelStore(mode);
  const setAccuracyRequirement = vi.fn();
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(App, {
          onContinue: () => {},
          saveTrainedModel: () => {},
          setAccuracyRequirement,
        }),
      ),
    ),
  );
  return {store, setAccuracyRequirement};
}

function trainModel(store) {
  act(() => {
    train.reset();
    train.init(store);
    train.onClickTrain();
  });
}

describe('setAccuracyRequirement', () => {
  beforeEach(() => I18n.initI18n());

  test('receives null when the level requires no accuracy', () => {
    const {setAccuracyRequirement} = renderApp({});
    expect(setAccuracyRequirement.mock.calls).toEqual([[null]]);
  });

  test('receives an unmet requirement when the level loads', () => {
    const {setAccuracyRequirement} = renderApp({requireAccuracy: 100});
    expect(setAccuracyRequirement.mock.calls).toEqual([
      [{minimum: 100, met: false}],
    ]);
  });

  test('is called after every training run, even when unchanged', () => {
    const {store, setAccuracyRequirement} = renderApp({
      trainer: 'decisionTree',
      requireAccuracy: 100,
    });
    trainModel(store);
    trainModel(store);
    expect(setAccuracyRequirement.mock.calls).toEqual([
      [{minimum: 100, met: false}],
      [{minimum: 100, met: true}],
      [{minimum: 100, met: true}],
    ]);
  });

  test('is called again when the next level has the same requirement', () => {
    const {store, setAccuracyRequirement} = renderApp({requireAccuracy: 100});
    act(() => {
      store.dispatch(resetState());
      store.dispatch(setMode({requireAccuracy: 100}));
    });
    expect(setAccuracyRequirement.mock.calls).toEqual([
      [{minimum: 100, met: false}],
      [{minimum: 100, met: false}],
    ]);
  });
});
