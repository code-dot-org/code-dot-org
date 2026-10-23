import {act, fireEvent, screen, waitFor, within} from '@testing-library/react';
import {createElement, Fragment} from 'react';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {resetState, setCurrentColumn} from '@cdo/apps/ailab/engine/redux';
import ColumnAnalysis from '@cdo/apps/ailab/engine/UIComponents/ColumnAnalysis';
import DataDisplay from '@cdo/apps/ailab/engine/UIComponents/DataDisplay';

import {ANIMALS, levelProject, levelStore} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

function renderDisplay() {
  const store = levelStore();
  const project = levelProject();
  renderWithProviders(
    createElement(
      Fragment,
      null,
      createElement(DataDisplay),
      createElement(ColumnAnalysis)
    ),
    {store, project}
  );
  return store;
}

const button = name => screen.getByRole('button', {name});

const rowNumbers = () =>
  Array.from(document.querySelectorAll('tbody th'), cell => cell.textContent);

describe('DataDisplay', () => {
  beforeEach(() => I18n.initI18n());

  test('opens on the table', () => {
    renderDisplay();
    expect(screen.getByRole('table')).toBeTruthy();
    expect(button('Table').getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByLabelText('Next card')).toBeNull();
  });

  test('cards shows one dataset row and steps to the next', () => {
    renderDisplay();
    fireEvent.click(button('Cards'));

    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText('Card 1 of 10')).toBeTruthy();
    expect(screen.getByText('bird')).toBeTruthy();
    expect(button('Previous card').getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(button('Previous card'));
    expect(screen.getByText('Card 1 of 10')).toBeTruthy();

    fireEvent.click(button('Next card'));
    expect(screen.getByText('Card 2 of 10')).toBeTruthy();
    expect(screen.getByText('dog')).toBeTruthy();

    fireEvent.keyDown(button('Next card'), {key: 'ArrowLeft'});
    expect(screen.getByText('Card 1 of 10')).toBeTruthy();
  });

  test('marks the label and the features for screen readers', () => {
    renderDisplay();
    fireEvent.click(button('Cards'));
    const roleText = role =>
      document.querySelector(`dt[data-role="${role}"]`).textContent;
    expect(roleText('label')).toBe('animal, used as the label');
    expect(roleText('feature')).toBe('legs, used as a feature');
  });

  test('next stays focused and inert on the last row', () => {
    renderDisplay();
    fireEvent.click(button('Cards'));
    const next = button('Next card');
    next.focus();
    fireEvent.keyDown(next, {key: 'End'});

    expect(screen.getByText('Card 10 of 10')).toBeTruthy();
    expect(next.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(next);

    fireEvent.click(next);
    expect(screen.getByText('Card 10 of 10')).toBeTruthy();
  });

  test('a new level or dataset starts the deck on its first row', () => {
    const store = renderDisplay();
    fireEvent.click(button('Cards'));
    fireEvent.click(button('Next card'));
    expect(store.getState().datasetCardRow).toBe(1);

    act(() => store.dispatch(resetState()));
    expect(store.getState().datasetCardRow).toBe(0);
  });

  test('only the front card is in the tab order', () => {
    renderDisplay();
    fireEvent.click(button('Cards'));
    fireEvent.click(button('Next card'));
    const tabIndexes = [...document.querySelectorAll('dl')].map(
      list => list.tabIndex
    );
    expect(tabIndexes).toEqual([-1, 0]);
  });

  test('cards hide the column analysis, and the table brings it back', () => {
    const store = renderDisplay();
    act(() => store.dispatch(setCurrentColumn('animal')));
    expect(screen.getByLabelText('Close column analysis')).toBeTruthy();

    fireEvent.click(button('Cards'));
    expect(screen.queryByLabelText('Close column analysis')).toBeNull();

    fireEvent.click(button('Table'));
    expect(screen.getByLabelText('Close column analysis')).toBeTruthy();
  });

  test('sorts by a column and keeps each row its dataset number', () => {
    renderDisplay();
    fireEvent.click(button('Sort by legs low to high'));

    expect(
      screen.getByRole('columnheader', {name: 'legs'}).getAttribute('aria-sort')
    ).toBe('ascending');
    expect(rowNumbers().join(' ')).toBe('3 6 9 1 4 7 2 5 8 10');
  });

  test('the sort button names what the next click does', () => {
    renderDisplay();
    fireEvent.click(button('Sort by animal A-Z'));
    fireEvent.click(button('Sort by animal Z-A'));

    expect(
      button('Original order').closest('th').getAttribute('aria-sort')
    ).toBe('descending');
    expect(rowNumbers().slice(0, 3)).toEqual(['3', '6', '9']);

    fireEvent.click(button('Original order'));
    expect(
      button('Sort by animal A-Z').closest('th').hasAttribute('aria-sort')
    ).toBe(false);
    expect(rowNumbers().slice(0, 3)).toEqual(['1', '2', '3']);
  });

  test('sorts text by the value it shows', () => {
    I18n.initI18n({
      datasets: {
        unknown: {
          values: {
            bird: () => 'oiseau',
            dog: () => 'chien',
            snake: () => 'serpent',
          },
        },
      },
    });
    renderDisplay();
    fireEvent.click(button('Sort by animal A-Z'));

    expect(rowNumbers().join(' ')).toBe('2 5 8 10 1 4 7 3 6 9');
  });

  test('filters one categorical column and counts the matching rows', () => {
    renderDisplay();
    fireEvent.click(button('Filter'));
    const menu = screen.getByRole('dialog', {name: 'Filter rows'});
    fireEvent.click(within(menu).getByRole('button', {name: /^animal/}));
    fireEvent.click(within(menu).getByRole('checkbox', {name: 'dog'}));

    expect(rowNumbers().join(' ')).toBe('2 5 8 10');
    expect(screen.getByText('4 of 10 rows')).toBeTruthy();
    expect(within(menu).getByRole('button', {name: 'Done (1)'})).toBeTruthy();
  });

  test('lists only the categorical columns, with their value counts', () => {
    renderDisplay();
    fireEvent.click(button('Filter'));
    const menu = screen.getByRole('dialog', {name: 'Filter rows'});

    expect(
      within(menu)
        .getAllByRole('button', {name: /categor/})
        .map(item => item.textContent)
    ).toEqual(['animal 3 categories']);
  });

  test('hides the filter when no column can be filtered', () => {
    const columns = {legs: ColumnTypes.NUMERICAL};
    renderWithProviders(createElement(DataDisplay), {
      store: levelStore(
        undefined,
        ANIMALS.map(({legs}) => ({legs})),
        columns
      ),
      project: levelProject(columns, 'legs'),
    });

    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Filter'})).toBeNull();
  });

  test('closing the filter focuses its tag, and cards show only the matching rows', async () => {
    renderDisplay();
    button('Filter').focus();
    fireEvent.click(button('Filter'));
    fireEvent.click(button(/^animal/));
    fireEvent.click(screen.getByRole('checkbox', {name: 'dog'}));
    fireEvent.click(button('Done (1)'));
    await waitFor(() =>
      expect(document.activeElement).toBe(button('Filter by animal: dog'))
    );

    fireEvent.click(button('Cards'));
    expect(screen.getByText('4 of 10 rows')).toBeTruthy();
    expect(screen.getByText('Card 1 of 4')).toBeTruthy();
    expect(screen.getByText('Row 2')).toBeTruthy();
  });

  test('clearing the tag shows every row and focuses the filter button', async () => {
    renderDisplay();
    fireEvent.click(button('Filter'));
    fireEvent.click(button(/^animal/));
    fireEvent.click(screen.getByRole('checkbox', {name: 'dog'}));
    fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
    await waitFor(() => button('Filter by animal: dog'));

    fireEvent.click(button('Clear filter'));

    expect(screen.getByText('10 rows')).toBeTruthy();
    expect(document.activeElement).toBe(button('Filter'));
  });

  test('clearing from the menu moves focus to Done', () => {
    renderDisplay();
    fireEvent.click(button('Filter'));
    fireEvent.click(button(/^animal/));
    fireEvent.click(screen.getByRole('checkbox', {name: 'dog'}));
    const menu = screen.getByRole('dialog', {name: 'Filter rows'});
    const clear = within(menu).getByRole('button', {name: 'Clear filter'});
    clear.focus();
    fireEvent.click(clear);

    expect(clear.disabled).toBe(true);
    expect(document.activeElement).toBe(
      within(menu).getByRole('button', {name: 'Done'})
    );
  });

  test('opening a column focuses its first value, and Back refocuses the column', () => {
    renderDisplay();
    fireEvent.click(button('Filter'));
    const menu = screen.getByRole('dialog', {name: 'Filter rows'});
    fireEvent.click(within(menu).getByRole('button', {name: /^animal/}));

    expect(document.activeElement).toBe(
      within(menu).getByRole('checkbox', {name: 'bird'})
    );

    fireEvent.click(
      within(menu).getByRole('button', {name: 'Back to columns'})
    );

    expect(document.activeElement).toBe(
      within(menu).getByRole('button', {name: /^animal/})
    );
  });

  describe('with an id column', () => {
    const NAMED = ANIMALS.map((row, index) => ({
      ...row,
      name: `pet ${index + 1}`,
    }));

    const renderNamed = () =>
      renderWithProviders(createElement(DataDisplay), {
        store: levelStore({idColumn: 'name'}, NAMED),
        project: levelProject(),
      });

    test('follows the row number and heads each row', () => {
      renderNamed();
      expect(
        screen
          .getAllByRole('columnheader')
          .map(header => header.getAttribute('aria-label'))
      ).toEqual(['Row', 'name', 'animal', 'legs']);
      expect(
        Array.from(
          screen.getAllByRole('row')[1].cells,
          cell => cell.textContent
        )
      ).toEqual(['1', 'pet 1', 'bird', '2']);
      expect(rowNumbers().slice(0, 3)).toEqual(['pet 1', 'pet 2', 'pet 3']);
      expect(button('Sort by name A-Z')).toBeTruthy();
    });

    test('titles each card above its row number, and leaves the list', () => {
      renderNamed();
      fireEvent.click(button('Cards'));
      fireEvent.click(button('Next card'));

      const card = screen.getByRole('group', {name: 'pet 2 Row 2'});
      expect(
        Array.from(card.querySelectorAll('dt'), term => term.textContent)
      ).toEqual(['animal, used as the label', 'legs, used as a feature']);
    });

    test('titles a card with a blank id by its row number', () => {
      renderWithProviders(createElement(DataDisplay), {
        store: levelStore({idColumn: 'name'}, [
          {...NAMED[0], name: ''},
          ...NAMED.slice(1),
        ]),
        project: levelProject(),
      });
      fireEvent.click(button('Cards'));

      expect(screen.getByRole('group', {name: 'Row 1'})).toBeTruthy();
    });
  });
});
