import {fireEvent, screen, within} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '@cdo/apps/ailab/engine/i18n';
import {
  setAccuracyCheckExamples,
  setAccuracyCheckLabels,
  setAccuracyCheckPredictedLabels,
  setImportedData,
} from '@cdo/apps/ailab/engine/redux';
import ResultsDetails from '@cdo/apps/ailab/engine/UIComponents/ResultsDetails';

import {ANIMALS, levelProject, levelStore} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

const NAMED_ANIMALS = ANIMALS.map((row, index) => ({
  name: ['Tweety', 'Fido', 'Slither'][index] || row.animal,
  ...row,
}));

function renderScorecard({
  data,
  predictedLabels = ['bird', 'dog', 'bird'],
} = {}) {
  const store = levelStore();
  if (data) {
    store.dispatch(setImportedData(data, false));
  }
  store.dispatch(setAccuracyCheckExamples([[2], [4], [0]]));
  store.dispatch(setAccuracyCheckLabels(['bird', 'dog', 'snake']));
  store.dispatch(setAccuracyCheckPredictedLabels(predictedLabels));
  renderWithProviders(createElement(ResultsDetails), {
    store,
    project: {
      ...levelProject(),
      accuracyCheckRowIndices: [0, 1, 2],
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

    expect(headerRows()).toEqual([['', 'legs', 'animal', 'AI predicts']]);
  });

  test('puts the results table in the tab order', () => {
    renderScorecard();

    expect(screen.getByRole('group', {name: 'Results'}).tabIndex).toBe(0);
  });

  test('shows the rows the model got right, then the rows it missed', () => {
    renderScorecard();

    expect(screen.getByRole('button', {name: 'Correct (2)'})).toBeTruthy();
    expect(bodyRows()).toEqual([
      ['1', '2', 'bird', 'bird'],
      ['2', '4', 'dog', 'dog'],
    ]);

    fireEvent.click(screen.getByRole('button', {name: 'Incorrect (1)'}));

    expect(bodyRows()).toEqual([['3', '0', 'snake', 'bird']]);
    expect(
      screen
        .getByRole('button', {name: 'Incorrect (1)'})
        .getAttribute('aria-pressed')
    ).toBe('true');
  });

  test('says when the selected grade has no rows', () => {
    renderScorecard({predictedLabels: ['bird', 'dog', 'snake']});

    fireEvent.click(screen.getByRole('button', {name: 'Incorrect (0)'}));

    expect(screen.getByText('No rows matched this filter')).toBeTruthy();
  });

  test('shows the other dataset columns on request', () => {
    renderScorecard({data: NAMED_ANIMALS});

    fireEvent.click(screen.getByLabelText('Show all columns'));

    expect(headerRows()).toEqual([
      ['', 'name', 'legs', 'animal', 'AI predicts'],
    ]);
    expect(bodyRows()[0]).toEqual(['1', 'Tweety', '2', 'bird', 'bird']);

    fireEvent.click(screen.getByLabelText('Show only features and label'));

    expect(bodyRows()[0]).toEqual(['1', '2', 'bird', 'bird']);
  });
});
