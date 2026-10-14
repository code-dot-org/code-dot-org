import {fireEvent, screen, within} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '@cdo/apps/ailab/engine/i18n';
import {
  setAccuracyCheckExamples,
  setAccuracyCheckLabels,
  setAccuracyCheckPredictedLabels,
} from '@cdo/apps/ailab/engine/redux';
import ResultsDetails from '@cdo/apps/ailab/engine/UIComponents/ResultsDetails';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

function renderScorecard() {
  const store = levelStore();
  store.dispatch(setAccuracyCheckExamples([[2], [4], [0]]));
  store.dispatch(setAccuracyCheckLabels(['bird', 'dog', 'snake']));
  store.dispatch(setAccuracyCheckPredictedLabels(['bird', 'dog', 'bird']));
  renderWithProviders(createElement(ResultsDetails), {
    store,
    project: {
      ...levelProject(),
      historicResults: [
        {label: 'animal', features: ['legs'], accuracy: '66.67'},
      ],
    },
  });
}

function rowsIn(rowgroup) {
  return within(rowgroup)
    .getAllByRole('row')
    .map(row =>
      Array.from(row.querySelectorAll('th, td'), cell => cell.textContent)
    );
}

function headerRows() {
  return rowsIn(screen.getAllByRole('rowgroup')[0]);
}

function bodyRows() {
  return rowsIn(screen.getAllByRole('rowgroup')[1]);
}

describe('ResultsDetails', () => {
  beforeAll(() => {
    I18n.initI18n();
  });

  test('reads the current model and its accuracy', () => {
    renderScorecard();

    expect(screen.getByText('Predict animal based on legs')).toBeTruthy();
    expect(screen.getByText('66.67% Accuracy')).toBeTruthy();
  });

  test('heads the feature, actual and predicted columns', () => {
    renderScorecard();

    expect(headerRows()).toEqual([
      ['Feature', 'Actual', 'AI Prediction'],
      ['legs', 'animal', 'animal'],
    ]);
  });

  test('shows the rows the model got right, then the rows it missed', () => {
    renderScorecard();

    expect(bodyRows()).toEqual([
      ['2', 'bird', 'bird'],
      ['4', 'dog', 'dog'],
    ]);

    fireEvent.click(screen.getByRole('button', {name: 'Incorrect'}));

    expect(bodyRows()).toEqual([['0', 'snake', 'bird']]);
    expect(
      screen
        .getByRole('button', {name: 'Incorrect'})
        .getAttribute('aria-pressed')
    ).toBe('true');
  });
});
