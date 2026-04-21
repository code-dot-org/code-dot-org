import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {ExportSurveysButton} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/surveys/components/ExportSurveysButton';

jest.mock('@cdo/apps/util/useFetch');
const mockUseFetch = require('@cdo/apps/util/useFetch').useFetch as jest.Mock;

describe('ExportSurveysButton', () => {
  const user = userEvent.setup();
  const mockFetch = jest.fn();

  const renderDefault = () =>
    render(
      <MemoryRouter initialEntries={['/workshops/42/surveys/post']}>
        <Routes>
          <Route
            path="/workshops/:workshopId/surveys/post"
            element={<ExportSurveysButton />}
          />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    mockUseFetch.mockReturnValue({
      data: [
        {name: 'surveys/pd/form1', version: '1'},
        {name: 'surveys/pd/form2', version: '2'},
      ],
    });
    jest.spyOn(window, 'fetch').mockImplementation(mockFetch);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockFetch.mockRestore();
  });

  it('renders the Export survey results button and opens the dialog on click', async () => {
    renderDefault();

    const exportButton = screen.getByRole('button', {
      name: 'Export survey results',
    });
    expect(exportButton).toBeInTheDocument();

    await user.click(exportButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Export Survey Results')).toBeInTheDocument();

    const formItems = screen.getAllByText(/Version:/);
    expect(formItems).toHaveLength(2);
  });

  it('successful download: calls fetch and then window.open with the correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    renderDefault();

    await user.click(
      screen.getByRole('button', {name: 'Export survey results'})
    );

    const downloadButtons = screen.getAllByRole('button', {
      name: 'Download csv',
    });

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    await user.click(downloadButtons[0]);

    const expectedUrl =
      '/api/v1/pd/workshops/42/foorm/csv_survey_report?name=surveys%2Fpd%2Fform1&version=1';

    expect(mockFetch).toHaveBeenCalledWith(expectedUrl, {method: 'GET'});
    expect(openSpy).toHaveBeenCalledWith(expectedUrl);

    openSpy.mockRestore();
  });

  it('shows API error message when fetch returns ok=false with an error payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({error: 'Failed to generate CSV.'}),
    } as Response);

    renderDefault();

    await user.click(
      screen.getByRole('button', {name: 'Export survey results'})
    );

    const downloadButtons = screen.getAllByRole('button', {
      name: 'Download csv',
    });
    await act(async () => {
      await user.click(downloadButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to generate CSV.')).toBeInTheDocument();
    });

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('shows a generic error message when fetch throws (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network down'));

    renderDefault();

    await user.click(
      screen.getByRole('button', {name: 'Export survey results'})
    );

    const downloadButtons = screen.getAllByRole('button', {
      name: 'Download csv',
    });
    await act(async () => {
      await user.click(downloadButtons[0]);
    });

    await waitFor(() => {
      expect(
        screen.getByText('An unknown error occurred. Please try again.')
      ).toBeInTheDocument();
    });

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });
});
