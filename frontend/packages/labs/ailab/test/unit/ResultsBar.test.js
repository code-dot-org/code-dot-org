import {ThemeProvider} from '@mui/material/styles';
import {fireEvent, render, screen, within} from '@testing-library/react';
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

function previousResultsButton() {
  return screen.getByRole('button', {name: 'Previous results'});
}

function selectedTab() {
  return within(screen.getByRole('dialog'))
    .getAllByRole('tab')
    .find(tab => tab.getAttribute('aria-selected') === 'true').textContent;
}

describe('ResultsBar', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('reads the newest model as a sentence', () => {
    renderBar([
      {label: 'animal', features: ['legs'], accuracy: '60.00'},
      {label: 'legs', features: ['animal'], accuracy: '80.00'},
    ]);

    expect(screen.getByText('Predict legs based on animal')).toBeTruthy();
    expect(
      screen.getByRole('button', {name: 'View 80% Accuracy details'}),
    ).toBeTruthy();
  });

  test('shows nothing before a model is trained', () => {
    renderBar([]);

    expect(screen.queryByText(/^Predict /)).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('opens Results on the scorecard from the accuracy button', () => {
    const store = renderBar([
      {label: 'animal', features: ['legs'], accuracy: '80.00'},
    ]);

    fireEvent.click(
      screen.getByRole('button', {name: 'View 80% Accuracy details'}),
    );

    expect(store.getState().showResultsDetails).toBe(true);
    expect(selectedTab()).toBe('Scorecard');
  });

  test('lists earlier models, newest first, under Previous results', () => {
    renderBar([
      {label: 'animal', features: ['legs'], accuracy: '50.00'},
      {label: 'legs', features: ['animal'], accuracy: '60.00'},
      {label: 'animal', features: ['legs'], accuracy: '70.00'},
    ]);

    fireEvent.click(previousResultsButton());

    expect(selectedTab()).toBe('Previous results');
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows.slice(1).map(row => row.textContent)).toEqual([
      expect.stringContaining('60%'),
      expect.stringContaining('50%'),
    ]);
  });

  test('says so when there is no earlier model', () => {
    renderBar([{label: 'animal', features: ['legs'], accuracy: '80.00'}]);

    fireEvent.click(previousResultsButton());

    expect(screen.getByText(/No previous results yet/)).toBeTruthy();
  });

  test('closes Results from Back to Testing', () => {
    const store = renderBar([
      {label: 'animal', features: ['legs'], accuracy: '80.00'},
    ]);
    fireEvent.click(previousResultsButton());

    fireEvent.click(screen.getByRole('button', {name: 'Back to Testing'}));

    expect(store.getState().showResultsDetails).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
