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
  workshopInfo: {
    id: 1,
    course: 'Build Your Own Workshop',
    name: 'My Sick Workshop',
    format: 'virtual' as const,
    regionalPartnerName: 'Reggie Partner',
    sessions: [],
  },
  userInfo: {
    id: 1,
    displayName: 'Ms. McEntire',
    givenName: 'Reba',
    familyName: 'McEntire',
    email: 'reba@mcentire.com',
    schoolInfo: {
      schoolId: 1,
      country: 'United States',
      schoolName: 'Sample School Name',
      schoolZip: '11111',
      schoolType: undefined,
    },
  },
  workshopEnrollmentStatus: SUBMISSION_STATUSES.UNSUBMITTED,
};

const renderDefault = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  render(<WorkshopJoin {...props} />);
};

describe('WorkshopJoin', () => {
  it('enrollment status of Duplicate tells user they are already enrolled', () => {
    renderDefault({workshopEnrollmentStatus: SUBMISSION_STATUSES.DUPLICATE});
    screen.getByText('Duplicate enrollment');
  });

  it('enrollment status of Own tells user they cannot enroll in their own workshop', () => {
    renderDefault({workshopEnrollmentStatus: SUBMISSION_STATUSES.OWN});
    screen.getByText('Your own workshop');
  });

  it('enrollment status of Closed tells user the workshop is closed', () => {
    renderDefault({workshopEnrollmentStatus: SUBMISSION_STATUSES.CLOSED});
    screen.getByText('Closed');
  });

  it('enrollment status of Full tells user the workshop is full', () => {
    renderDefault({workshopEnrollmentStatus: SUBMISSION_STATUSES.FULL});
    screen.getByText('Full');
  });

  it('enrollment status of Not Found tells user the workshop cannot be found', () => {
    renderDefault({workshopEnrollmentStatus: SUBMISSION_STATUSES.NOT_FOUND});
    screen.getByText('Not found');
  });

  it('enrollment status of Unsubmitted shows user the info to enroll and their UserPassport', () => {
    renderDefault({
      workshopEnrollmentStatus: SUBMISSION_STATUSES.UNSUBMITTED,
    });

    screen.getByText('Review your information');
    screen.getByText(DEFAULT_PROPS.userInfo.displayName);
    screen.getByText(
      `${DEFAULT_PROPS.userInfo.givenName} ${DEFAULT_PROPS.userInfo.familyName}`
    );
    screen.getByText(DEFAULT_PROPS.userInfo.email);
    screen.getByText(DEFAULT_PROPS.userInfo.schoolInfo.schoolName);
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
      ...DEFAULT_PROPS.userInfo.schoolInfo,
      schoolType: NonSchoolOptions.NO_SCHOOL_SETTING,
    };
    renderDefault({
      userInfo: {
        ...DEFAULT_PROPS.userInfo,
        schoolInfo: noSchoolSettingSchoolInfo,
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
      userInfo: {
        givenName: '',
        schoolInfo: {},
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
        `/api/v1/pd/workshops/${DEFAULT_PROPS.workshopInfo.id}/enrollments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'authToken',
          },
          body: JSON.stringify({
            user_id: DEFAULT_PROPS.userInfo.id,
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
        `/api/v1/pd/workshops/${DEFAULT_PROPS.workshopInfo.id}/enrollments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'authToken',
          },
          body: JSON.stringify({
            user_id: DEFAULT_PROPS.userInfo.id,
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
