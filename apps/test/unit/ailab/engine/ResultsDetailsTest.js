import {fireEvent, screen, waitFor, within} from '@testing-library/react';
import {createElement} from 'react';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {
  setAccuracyCheckExamples,
  setAccuracyCheckLabels,
  setAccuracyCheckPredictedLabels,
  setColumnsByDataType,
  setImportedData,
} from '@cdo/apps/ailab/engine/redux';
import ResultsDetails from '@cdo/apps/ailab/engine/UIComponents/ResultsDetails';

import {ANIMAL_COLUMNS, ANIMALS, levelProject, levelStore} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

const NAMED_ANIMALS = ANIMALS.map((row, index) => ({
  name:
    ['Tweety', 'Fido', 'Slither', 'Polly', 'Rex', 'Kaa'][index] || row.animal,
  ...row,
}));

function renderScorecard({
  data,
  examples = [[2], [4], [0]],
  labels = ['bird', 'dog', 'snake'],
  predictedLabels = ['bird', 'dog', 'bird'],
  accuracyCheckRowIndices = [0, 1, 2],
  project = levelProject(),
  mode,
} = {}) {
  const store = levelStore(mode);
  if (data) {
    store.dispatch(setImportedData(data, false));
    Object.keys(data[0]).forEach(column =>
      store.dispatch(
        setColumnsByDataType(
          column,
          column === 'legs' ? ColumnTypes.NUMERICAL : ColumnTypes.CATEGORICAL
        )
      )
    );
  }
  store.dispatch(setAccuracyCheckExamples(examples));
  store.dispatch(setAccuracyCheckLabels(labels));
  store.dispatch(setAccuracyCheckPredictedLabels(predictedLabels));
  renderWithProviders(createElement(ResultsDetails), {
    store,
    project: {
      ...project,
      accuracyCheckRowIndices,
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

const sortButton = name => screen.getByRole('button', {name});

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

    fireEvent.click(screen.getByRole('button', {name: 'Expand columns'}));

    expect(headerRows()).toEqual([
      ['', 'name', 'legs', 'animal', 'AI predicts'],
    ]);
    expect(bodyRows()[0]).toEqual(['1', 'Tweety', '2', 'bird', 'bird']);

    fireEvent.click(screen.getByRole('button', {name: 'Collapse columns'}));

    expect(bodyRows()[0]).toEqual(['1', '2', 'bird', 'bird']);
  });

  test('an id column names each row, even with only the model columns shown', () => {
    renderScorecard({data: NAMED_ANIMALS, mode: {idColumn: 'name'}});

    expect(headerRows()).toEqual([
      ['', 'name', 'legs', 'animal', 'AI predicts'],
    ]);
    expect(bodyRows()).toEqual([
      ['1', 'Tweety', '2', 'bird', 'bird'],
      ['2', 'Fido', '4', 'dog', 'dog'],
    ]);
    expect(
      screen.getAllByRole('rowheader').map(header => header.textContent)
    ).toEqual(['Tweety', 'Fido']);
  });

  test('sorts another dataset column by its own row', () => {
    renderScorecard({data: NAMED_ANIMALS, accuracyCheckRowIndices: [3, 4, 5]});
    fireEvent.click(screen.getByRole('button', {name: 'Expand columns'}));
    fireEvent.click(sortButton('Sort by name A-Z'));
    fireEvent.click(sortButton('Sort by name Z-A'));

    expect(bodyRows()).toEqual([
      ['5', 'Rex', '4', 'dog', 'dog'],
      ['4', 'Polly', '2', 'bird', 'bird'],
    ]);
  });

  test('sorts numerical predictions by value', () => {
    renderScorecard({
      project: levelProject(ANIMAL_COLUMNS, 'legs'),
      examples: [['bird'], ['dog'], ['snake']],
      labels: [1.5, 1.25, 10],
      predictedLabels: [1.5, 1.25, 10],
    });
    fireEvent.click(sortButton('Sort by AI predicts low to high'));

    expect(bodyRows()).toEqual([
      ['2', 'dog', '1.25', '1.25'],
      ['1', 'bird', '1.5', '1.5'],
      ['3', 'snake', '10', '10'],
    ]);
  });

  test('filters by the AI prediction, counts each grade, and says when no shown row matches', async () => {
    renderScorecard();
    expect(screen.getByRole('button', {name: 'Correct (2)'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Incorrect (1)'})).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: 'Filter'}));
    fireEvent.click(screen.getByRole('button', {name: /^AI predicts/}));
    fireEvent.click(screen.getByRole('checkbox', {name: 'dog'}));
    fireEvent.click(screen.getByRole('button', {name: 'Done (1)'}));
    const incorrect = await waitFor(() =>
      screen.getByRole('button', {name: 'Incorrect (0)'})
    );
    expect(screen.getByRole('button', {name: 'Correct (1)'})).toBeTruthy();
    expect(bodyRows()).toEqual([['2', '4', 'dog', 'dog']]);

    fireEvent.click(incorrect);

    expect(screen.getByText('No rows match this filter.')).toBeTruthy();
  });
});
