import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {ExportSurveysButton} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/surveys/components/ExportSurveysButton';

jest.mock('@cdo/apps/util/useFetch');
const mockUseFetch = require('@cdo/apps/util/useFetch').useFetch as jest.Mock;

describe('ExportSurveysButton', () => {
  const user = userEvent.setup();

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
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('triggers the correct download URL when clicking Download csv', async () => {
    renderDefault();

    const exportButton = screen.getByRole('button', {
      name: 'Export survey results',
    });
    await user.click(exportButton);

    const downloadButtons = screen.getAllByRole('button', {
      name: 'Download csv',
    });
    expect(downloadButtons).toHaveLength(2);

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    await user.click(downloadButtons[0]);

    expect(openSpy).toHaveBeenCalledWith(
      '/api/v1/pd/workshops/42/foorm/csv_survey_report?name=surveys%2Fpd%2Fform1&version=1'
    );
    openSpy.mockRestore();
  });
});
