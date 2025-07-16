import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {SUBMISSION_STATUSES} from '@cdo/apps/code-studio/pd/workshop_enrollment/constants';
import WorkshopJoin from '@cdo/apps/code-studio/pd/workshop_enrollment/WorkshopJoin';
import * as utils from '@cdo/apps/utils';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockResolvedValue('authToken'),
}));

const DEFAULT_PROPS = {
  workshop_enrollment_status: SUBMISSION_STATUSES.UNSUBMITTED,
  workshop_info: {
    id: 1,
    course: 'Build Your Own Workshop',
    name: 'My Sick Workshop',
    format: 'Virtual',
    rp_name: 'Reggie Partner',
    session_info_for_calendar: [],
  },
  user_info: {
    id: 1,
    display_name: 'Ms. McEntire',
    first_name: 'Reba',
    last_name: 'McEntire',
    email: 'reba@mcentire.com',
    school_info: {
      school_id: 1,
      country: 'United States',
      school_name: 'Sample School Name',
      school_zip: '11111',
      school_type: undefined,
    },
  },
};

const renderDefault = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  render(<WorkshopJoin {...props} />);
};

describe('WorkshopJoin', () => {
  it('enrollment status of Duplicate tells user they are already enrolled', () => {
    renderDefault({workshop_enrollment_status: SUBMISSION_STATUSES.DUPLICATE});
    screen.getByText('Duplicate enrollment');
  });

  it('enrollment status of Own tells user they cannot enroll in their own workshop', () => {
    renderDefault({workshop_enrollment_status: SUBMISSION_STATUSES.OWN});
    screen.getByText('Your own workshop');
  });

  it('enrollment status of Closed tells user the workshop is closed', () => {
    renderDefault({workshop_enrollment_status: SUBMISSION_STATUSES.CLOSED});
    screen.getByText('Closed');
  });

  it('enrollment status of Full tells user the workshop is full', () => {
    renderDefault({workshop_enrollment_status: SUBMISSION_STATUSES.FULL});
    screen.getByText('Full');
  });

  it('enrollment status of Not Found tells user the workshop cannot be found', () => {
    renderDefault({workshop_enrollment_status: SUBMISSION_STATUSES.NOT_FOUND});
    screen.getByText('Not found');
  });

  it('enrollment status of Unsubmitted shows user the info to enroll and their UserPassport', () => {
    renderDefault({
      workshop_enrollment_status: SUBMISSION_STATUSES.UNSUBMITTED,
    });

    screen.getByText('Review your information');
    screen.getByText(DEFAULT_PROPS.user_info.display_name);
    screen.getByText(
      `${DEFAULT_PROPS.user_info.first_name} ${DEFAULT_PROPS.user_info.last_name}`
    );
    screen.getByText(DEFAULT_PROPS.user_info.email);
    screen.getByText(DEFAULT_PROPS.user_info.school_info.school_name);
  });

  it('enroll button is enabled and no errors are shown if all UserPassport fields are present', () => {
    renderDefault();

    expect(screen.queryByText('Add your full name')).toBe(null);
    expect(screen.queryByText('Add your school')).toBe(null);
    expect(
      screen.getByRole('button', {name: 'Join this workshop'})
    ).not.toBeDisabled();
  });

  it('enroll button is enabled and no errors are shown if user does not teach in a school setting', () => {
    const noSchoolSettingSchoolInfo = {
      ...DEFAULT_PROPS.user_info.school_info,
      school_type: NonSchoolOptions.NO_SCHOOL_SETTING,
    };
    renderDefault({
      user_info: {
        ...DEFAULT_PROPS.user_info,
        school_info: noSchoolSettingSchoolInfo,
      },
    });

    expect(screen.queryByText('Add your full name')).toBe(null);
    expect(screen.queryByText('Add your school')).toBe(null);
    expect(
      screen.getByRole('button', {name: 'Join this workshop'})
    ).not.toBeDisabled();
  });

  it('enroll button is disabled and errors are shown if there are missing UserPassport fields', () => {
    renderDefault({
      user_info: {
        first_name: '',
        school_info: {},
      },
    });

    screen.getByText('Add your full name');
    screen.getByText('Add your school');
    expect(
      screen.getByRole('button', {name: 'Join this workshop'})
    ).toBeDisabled();
  });

  it('errors in enrollment submission tells user error occurred', async () => {
    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          workshop_enrollment_status: SUBMISSION_STATUSES.UNKNOWN_ERROR,
          error_message: 'Sample error message.',
        }),
    } as Response);
    renderDefault();

    fireEvent.click(screen.getByText('Join this workshop'));

    await waitFor(() => {
      screen.getByText('Error submitting');

      expect(fetchStub).toHaveBeenCalledWith(
        `/api/v1/pd/workshops/${DEFAULT_PROPS.workshop_info.id}/enrollments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'authToken',
          },
          body: JSON.stringify({
            user_id: DEFAULT_PROPS.user_info.id,
          }),
        }
      );
    });

    fetchStub.mockRestore();
  });

  it('successful enrollment submission sends user to My PL page', async () => {
    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          workshop_enrollment_status: SUBMISSION_STATUSES.SUCCESS,
          error_message: '',
        }),
    } as Response);
    const navigateToHrefStub = jest
      .spyOn(utils, 'navigateToHref')
      .mockClear()
      .mockImplementation();
    renderDefault();

    fireEvent.click(screen.getByText('Join this workshop'));

    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        `/api/v1/pd/workshops/${DEFAULT_PROPS.workshop_info.id}/enrollments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'authToken',
          },
          body: JSON.stringify({
            user_id: DEFAULT_PROPS.user_info.id,
          }),
        }
      );
      expect(utils.navigateToHref).toHaveBeenCalledWith(
        '/my-professional-learning'
      );
    });

    fetchStub.mockRestore();
    navigateToHrefStub.mockRestore();
  });
});
