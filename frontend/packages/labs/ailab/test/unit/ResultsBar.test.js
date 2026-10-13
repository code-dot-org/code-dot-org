import {fireEvent, screen, within} from '@testing-library/react';
import {createElement} from 'react';

import I18n from '../../src/i18n';
import ResultsBar from '../../src/UIComponents/ResultsBar';

import {levelProject, levelStore} from './levelStore';
import {renderWithProviders} from './renderWithProviders';

function renderBar(results) {
  renderWithProviders(createElement(ResultsBar), {
    store: levelStore(),
    project: {...levelProject(), historicResults: [...results].reverse()},
  });
}

function allResultsButton() {
  return screen.getByRole('button', {name: 'All results'});
}

function modelRows(table) {
  return within(table)
    .getAllByRole('row')
    .slice(1)
    .map(row => row.textContent);
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
    renderBar([{label: 'animal', features: ['legs'], accuracy: '80.00'}]);

    fireEvent.click(
      screen.getByRole('button', {name: 'View 80% Accuracy details'}),
    );

    expect(selectedTab()).toBe('Scorecard');
    const scorecard = screen.getByRole('tabpanel', {name: 'Scorecard'});
    expect(within(scorecard).getByText('Actual')).toBeTruthy();
  });

  test('focuses the tab Results opened on', () => {
    renderBar([{label: 'animal', features: ['legs'], accuracy: '80.00'}]);

    fireEvent.click(allResultsButton());

    expect(document.activeElement).toBe(
      screen.getByRole('tab', {name: 'All results'}),
    );
  });

  test('lists the current model, then earlier ones newest first', () => {
    renderBar([
      {label: 'animal', features: ['legs'], accuracy: '50.00'},
      {label: 'legs', features: ['animal'], accuracy: '60.00'},
      {label: 'animal', features: ['legs'], accuracy: '70.00'},
    ]);

    fireEvent.click(allResultsButton());

    expect(selectedTab()).toBe('All results');
    const [current, previous] = screen.getAllByRole('table');
    expect(
      within(current).getByRole('columnheader', {name: 'Current'}),
    ).toBeTruthy();
    expect(modelRows(current)).toEqual([expect.stringContaining('70%')]);
    expect(
      within(previous).getByRole('columnheader', {name: 'Previous'}),
    ).toBeTruthy();
    expect(modelRows(previous)).toEqual([
      expect.stringContaining('60%'),
      expect.stringContaining('50%'),
    ]);
    expect(screen.queryByText(/No previous results yet/)).toBeNull();
  });

  test('says so when there is no earlier model', () => {
    renderBar([{label: 'animal', features: ['legs'], accuracy: '80.00'}]);

    fireEvent.click(allResultsButton());

    expect(modelRows(screen.getByRole('table'))).toEqual([
      expect.stringContaining('80%'),
    ]);
    expect(screen.getByText(/No previous results yet/)).toBeTruthy();
  });

  test('closes Results from Back to Testing', () => {
    renderBar([{label: 'animal', features: ['legs'], accuracy: '80.00'}]);
    fireEvent.click(allResultsButton());

    fireEvent.click(screen.getByRole('button', {name: 'Back to Testing'}));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('closes Results from the close button', () => {
    renderBar([{label: 'animal', features: ['legs'], accuracy: '80.00'}]);
    fireEvent.click(allResultsButton());

    fireEvent.click(screen.getByRole('button', {name: 'Close results'}));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('closes Results on Escape', () => {
    renderBar([{label: 'animal', features: ['legs'], accuracy: '80.00'}]);
    fireEvent.click(allResultsButton());

    fireEvent.keyDown(document, {key: 'Escape'});

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
