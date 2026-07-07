import {ThemeProvider} from '@mui/material/styles';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ExperimentsPage, {
  ServerExperiment,
} from '@cdo/apps/templates/experiments/ExperimentsPage';
import {getCurrentBrand, getMuiThemeForBrand} from '@cdo/apps/util/brand';
import experiments from '@cdo/apps/util/experiments';

import '@testing-library/jest-dom';

const pilotExperiment: ServerExperiment = {
  name: 'my-pilot',
  displayName: 'My Pilot',
  endAt: null,
  canLeave: true,
};

const grantedExperiment: ServerExperiment = {
  name: 'granted-experiment',
  displayName: null,
  endAt: '2026-12-31T00:00:00Z',
  canLeave: false,
};

const renderPage = (serverExperiments: ServerExperiment[]) =>
  render(
    <ThemeProvider theme={getMuiThemeForBrand(getCurrentBrand())}>
      <ExperimentsPage serverExperiments={serverExperiments} />
    </ThemeProvider>
  );

describe('ExperimentsPage', () => {
  beforeEach(() => {
    jest
      .spyOn(experiments, 'getLocalStorageExperimentDetails')
      .mockReturnValue([{key: 'browser-experiment'}]);
    jest.spyOn(experiments, 'setEnabled').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lists account and browser experiments', () => {
    renderPage([pilotExperiment, grantedExperiment]);

    expect(screen.getByText('My Pilot')).toBeInTheDocument();
    expect(screen.getByText('my-pilot')).toBeInTheDocument();
    expect(screen.getByText('granted-experiment')).toBeInTheDocument();
    expect(screen.getByText('browser-experiment')).toBeInTheDocument();
  });

  it('only offers to leave experiments that can be left', () => {
    renderPage([pilotExperiment, grantedExperiment]);

    expect(screen.getAllByRole('button', {name: 'Leave'})).toHaveLength(1);
  });

  it('shows empty states when there are no experiments', () => {
    jest
      .mocked(experiments.getLocalStorageExperimentDetails)
      .mockReturnValue([]);
    renderPage([]);

    expect(
      screen.getByText("You haven't joined any experiments.")
    ).toBeInTheDocument();
    expect(
      screen.getByText('No experiments are enabled in this browser.')
    ).toBeInTheDocument();
  });

  it('leaves an account experiment via the disable endpoint', async () => {
    const fetchSpy = jest
      .spyOn(window, 'fetch')
      .mockResolvedValue({ok: true} as Response);
    renderPage([pilotExperiment]);

    await userEvent.click(screen.getByRole('button', {name: 'Leave'}));

    expect(fetchSpy).toHaveBeenCalledWith(
      '/experiments/disable_single_user_experiment/my-pilot',
      {credentials: 'same-origin'}
    );
    await waitFor(() =>
      expect(screen.queryByText('my-pilot')).not.toBeInTheDocument()
    );
  });

  it('disables a browser experiment', async () => {
    renderPage([]);

    await userEvent.click(screen.getByRole('button', {name: 'Disable'}));

    expect(experiments.setEnabled).toHaveBeenCalledWith(
      'browser-experiment',
      false
    );
  });
});
