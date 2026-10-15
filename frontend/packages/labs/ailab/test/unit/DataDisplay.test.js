import {act, fireEvent, screen} from '@testing-library/react';
import {createElement, Fragment} from 'react';

import I18n from '../../src/i18n';
import {setCurrentColumn, setSelectedName} from '../../src/redux';
import ColumnAnalysis from '../../src/UIComponents/ColumnAnalysis';
import DataDisplay from '../../src/UIComponents/DataDisplay';

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

  test('a new dataset starts the deck on its first row', () => {
    const store = renderDisplay();
    fireEvent.click(button('Cards'));
    fireEvent.click(button('Next row'));
    expect(screen.getByText('Row 2 of 10')).toBeTruthy();

    act(() => store.dispatch(setSelectedName('Other dataset')));
    expect(screen.getByText('Row 1 of 10')).toBeTruthy();
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
});
