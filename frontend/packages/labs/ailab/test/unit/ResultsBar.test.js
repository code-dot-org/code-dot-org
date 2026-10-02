import {ThemeProvider} from '@mui/material/styles';
import {fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import I18n from '../../src/i18n';
import {setHistoricResult} from '../../src/redux';
import ResultsBar from '../../src/UIComponents/ResultsBar';

import {levelStore} from './levelStore';

function renderBar(results) {
  const store = levelStore();
  results.forEach(({label, features, accuracy}) =>
    store.dispatch(setHistoricResult(label, features, accuracy)),
  );
  render(
    createElement(
      Provider,
      {store},
      createElement(
        ThemeProvider,
        {theme: getMuiThemeForBrand(undefined)},
        createElement(ResultsBar),
      ),
    ),
  );
  return store;
}

describe('ResultsBar', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('reads the newest model as a sentence', () => {
    renderBar([{label: 'animal', features: ['legs'], accuracy: '80.00'}]);

    expect(screen.getByText('Predict animal based on legs')).toBeTruthy();
  });

  test('opens the details from the accuracy button', () => {
    const store = renderBar([
      {label: 'animal', features: ['legs'], accuracy: '80.00'},
    ]);

    fireEvent.click(screen.getByRole('button', {name: '80% Accuracy'}));

    expect(store.getState().showResultsDetails).toBe(true);
  });
});
