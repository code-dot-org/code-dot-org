import {fireEvent, screen, waitFor} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '@cdo/apps/ailab/engine/i18n';
import AccuracyCheckRowsPanel from '@cdo/apps/ailab/engine/UIComponents/AccuracyCheckRowsPanel';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

const ROWS = {correct: [0, 1, 2], incorrect: [3, 4], trained: []};

function renderPanel(splitByGrade) {
  renderWithProviders(
    createElement(AccuracyCheckRowsPanel, {
      rows: ROWS,
      splitByGrade,
      showAllColumns: false,
      onToggleColumns: () => {},
    }),
    {store: levelStore(), project: levelProject()}
  );
}

const rowNumbers = () =>
  Array.from(document.querySelectorAll('tbody th'), cell => cell.textContent);

describe('AccuracyCheckRowsPanel', () => {
  beforeEach(() => I18n.initI18n());
  afterEach(() => I18n.reset());

  test('counts every tested row when not split by grade', () => {
    renderPanel(false);

    expect(screen.getByText('5 Rows')).toBeTruthy();
    expect(rowNumbers()).toEqual(['1', '2', '3', '4', '5']);
  });

  test('the filter narrows both grade counts', async () => {
    renderPanel(true);
    expect(screen.getByRole('button', {name: 'Correct (3)'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Incorrect (2)'})).toBeTruthy();
    expect(rowNumbers()).toEqual(['1', '2', '3']);

    fireEvent.click(screen.getByRole('button', {name: 'Filter'}));
    fireEvent.click(screen.getByRole('button', {name: /^animal/}));
    fireEvent.click(screen.getByRole('checkbox', {name: 'bird'}));
    fireEvent.click(screen.getByRole('button', {name: 'Done (1)'}));

    const incorrect = await waitFor(() =>
      screen.getByRole('button', {name: 'Incorrect (1)'})
    );
    expect(screen.getByRole('button', {name: 'Correct (1)'})).toBeTruthy();
    expect(rowNumbers()).toEqual(['1']);

    fireEvent.click(incorrect);
    expect(rowNumbers()).toEqual(['4']);
  });
});
