import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import AssessmentsAnnouncementDialog from '@cdo/apps/templates/rubrics/AssessmentsAnnouncementDialog';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn().mockResolvedValue({
    json: jest.fn().mockReturnValue({}),
  }),
}));

describe('AssessmentsAnnouncementDialog', () => {
  it('renders the dialog', () => {
    render(<AssessmentsAnnouncementDialog />);
    expect(
      screen.getByRole('region', {
        name: i18n.aiAssessmentsAnnouncementHeading(),
      })
    ).toBeInTheDocument();
  });

  it('closes the dialog when the close button is clicked', async () => {
    render(<AssessmentsAnnouncementDialog />);
    fireEvent.click(screen.getByRole('button', {name: 'Close'}));
    expect(
      screen.queryByRole('region', {
        name: i18n.aiAssessmentsAnnouncementHeading(),
      })
    ).not.toBeInTheDocument();
  });

  it('navigates when Learn More is clicked', async () => {
    jest.spyOn(utils, 'navigateToHref').mockImplementation(() => {});
    render(<AssessmentsAnnouncementDialog />);
    fireEvent.click(screen.getByRole('button', {name: i18n.learnMore()}));
    await waitFor(() => {
      expect(utils.navigateToHref).toHaveBeenCalledWith(
        'https://code.org/ai/teaching-assistant'
      );
    });
  });
});
