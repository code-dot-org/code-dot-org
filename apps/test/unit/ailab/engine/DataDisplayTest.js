import {act, fireEvent, screen} from '@testing-library/react';
import {createElement, Fragment} from 'react';

import I18n from '@cdo/apps/ailab/engine/i18n';
import {resetState, setCurrentColumn} from '@cdo/apps/ailab/engine/redux';
import ColumnAnalysis from '@cdo/apps/ailab/engine/UIComponents/ColumnAnalysis';
import DataDisplay from '@cdo/apps/ailab/engine/UIComponents/DataDisplay';

import {levelProject, levelStore} from './levelStore';
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
    expect(screen.queryByLabelText('Next row')).toBeNull();
  });

  test('cards shows one dataset row and steps to the next', () => {
    renderDisplay();
    fireEvent.click(button('Cards'));

    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText('Row 1 of 10')).toBeTruthy();
    expect(screen.getByText('bird')).toBeTruthy();
    expect(button('Previous row').getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(button('Previous row'));
    expect(screen.getByText('Row 1 of 10')).toBeTruthy();

    fireEvent.click(button('Next row'));
    expect(screen.getByText('Row 2 of 10')).toBeTruthy();
    expect(screen.getByText('dog')).toBeTruthy();

    fireEvent.keyDown(button('Next row'), {key: 'ArrowLeft'});
    expect(screen.getByText('Row 1 of 10')).toBeTruthy();
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
    const next = button('Next row');
    next.focus();
    fireEvent.keyDown(next, {key: 'End'});

    expect(screen.getByText('Row 10 of 10')).toBeTruthy();
    expect(next.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(next);

    fireEvent.click(next);
    expect(screen.getByText('Row 10 of 10')).toBeTruthy();
  });

  test('a new level or dataset starts the deck on its first row', () => {
    const store = renderDisplay();
    fireEvent.click(button('Cards'));
    fireEvent.click(button('Next row'));
    expect(store.getState().datasetCardRow).toBe(1);

    act(() => store.dispatch(resetState()));
    expect(store.getState().datasetCardRow).toBe(0);
  });

  test('only the front card is in the tab order', () => {
    renderDisplay();
    fireEvent.click(button('Cards'));
    fireEvent.click(button('Next row'));
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
});
