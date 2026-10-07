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

function renderApp(mode) {
  const store = levelStore(mode);
  const onTrained = vi.fn();
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
          onTrained,
        }),
      ),
    ),
  );
  return {store, onTrained};
}

function trainModel(store) {
  act(() => {
    train.reset();
    train.init(store);
    train.onClickTrain();
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
    trainModel(store);
    trainModel(store);
    expect(onTrained.mock.calls).toEqual([[100], [100]]);
  });

  test('is not called when the next level loads', () => {
    const {store, onTrained} = renderApp({trainer: 'decisionTree'});
    trainModel(store);
    act(() => {
      store.dispatch(resetState());
      store.dispatch(setMode({}));
    });
    expect(onTrained).toHaveBeenCalledTimes(1);
  });
});
