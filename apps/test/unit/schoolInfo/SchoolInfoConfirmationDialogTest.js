import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import SchoolInfoConfirmationDialog from '@cdo/apps/schoolInfo/SchoolInfoConfirmationDialog';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockResolvedValue('authToken'),
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
}));

describe('SchoolInfoConfirmationDialog', () => {
  const MINIMUM_PROPS = {
    scriptData: {
      usIp: true,
      existingSchoolInfo: {
        user_school_info_id: 123,
      },
    },
    onClose: jest.fn(),
  };

  function renderComponent(props = {}) {
    const store = getStore();
    return render(
      <Provider store={store}>
        <SchoolInfoConfirmationDialog {...MINIMUM_PROPS} {...props} />
      </Provider>
    );
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the schoolinfointerstitial form', async () => {
    renderComponent({
      scriptData: {
        ...MINIMUM_PROPS.scriptData,
        existingSchoolInfo: {
          ...MINIMUM_PROPS.scriptData.existingSchoolInfo,
          country: 'US',
        },
      },
    });

    // Click the update button to show the school interstitial
    fireEvent.click(screen.getByRole('button', {name: 'No, update my info'}));

    await waitFor(() => {
      screen.getByText('Tell us about your school');
      screen.getByRole('button', {name: 'Save'});
      screen.getByRole('button', {name: 'Dismiss'});
    });
  });

  it('renders the school info confirmation dialog', () => {
    renderComponent({
      scriptData: {
        ...MINIMUM_PROPS.scriptData,
        existingSchoolInfo: {
          ...MINIMUM_PROPS.scriptData.existingSchoolInfo,
          country: 'US',
          school_name: 'TestName High',
        },
      },
    });

    screen.getByText('Welcome back! Are you still teaching at', {exact: false});
    screen.getByText('TestName High?');
    screen.getByRole('button', {name: 'No, update my info'});
    screen.getByRole('button', {name: 'Yes'});
  });

  it('confirms there are buttons in the school information confirmation modal', () => {
    renderComponent({
      scriptData: {
        ...MINIMUM_PROPS.scriptData,
        existingSchoolInfo: {
          ...MINIMUM_PROPS.scriptData.existingSchoolInfo,
          country: 'US',
        },
      },
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  describe('school info confirmation dialog behavior', () => {
    let fetchSpy;

    beforeEach(() => {
      fetchSpy = jest.spyOn(window, 'fetch').mockResolvedValue(new Response());
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('calls handleClickYes method when a user does not need to update school information', async () => {
      const onCloseMock = jest.fn();
      renderComponent({
        scriptData: {
          usIp: true,
          existingSchoolInfo: {
            user_school_info_id: 123,
            country: 'US',
          },
        },
        onClose: onCloseMock,
        isOpen: true,
      });

      // Click the yes button
      fireEvent.click(screen.getByRole('button', {name: 'Yes'}));

      // Assert that fetch was called with the correct URL
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          '/api/v1/user_school_infos/123/update_last_confirmation_date',
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'X-CSRF-Token': 'authToken',
            }),
          })
        );
      });

      // Assert that onClose was called
      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalled();
      });
    });
  });
});
