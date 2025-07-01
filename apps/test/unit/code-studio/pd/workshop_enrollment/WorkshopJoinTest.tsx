import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {SUBMISSION_STATUSES} from '@cdo/apps/code-studio/pd/workshop_enrollment/constants';
import WorkshopJoin from '@cdo/apps/code-studio/pd/workshop_enrollment/WorkshopJoin';

const DEFAULT_PROPS = {
  workshop_enrollment_status: SUBMISSION_STATUSES.UNSUBMITTED,
  workshop_info: {
    id: '1',
    course: 'Build Your Own Workshop',
    name: 'My Sick Workshop',
    format: 'Virtual',
    rp_name: 'Reggie Partner',
    session_info_for_calendar: [],
  },
  user_info: {
    display_name: 'Ms. McEntire',
    given_name: 'Reba',
    family_name: 'McEntire',
    email: 'reba@mcentire.com',
    school_name: 'Sample School Name',
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

  it('enrollment status of Unknown Error tells user an unknown error occurred upon submission', () => {
    renderDefault({
      workshop_enrollment_status: SUBMISSION_STATUSES.UNKNOWN_ERROR,
    });
    screen.getByText('Error submitting');
  });

  it('enrollment status of Unsubmitted shows user the info to enroll and their UserPassport', () => {
    renderDefault({
      workshop_enrollment_status: SUBMISSION_STATUSES.UNSUBMITTED,
    });

    screen.getByText('Review your information');
    screen.getByText(DEFAULT_PROPS.user_info.display_name);
    screen.getByText(
      `${DEFAULT_PROPS.user_info.given_name} ${DEFAULT_PROPS.user_info.family_name}`
    );
    screen.getByText(DEFAULT_PROPS.user_info.email);
    screen.getByText(DEFAULT_PROPS.user_info.school_name);
  });

  it('enroll button is enabled and no errors are shown if all UserPassport fields are present', () => {
    renderDefault();

    expect(screen.queryByText('Add your full name')).toBe(null);
    expect(screen.queryByText('Add your school')).toBe(null);
    expect(
      screen.getByRole('button', {name: 'Join this workshop'})
    ).not.toBeDisabled();
  });

  it('enroll button is disabled and errors are shown if there are missing UserPassport fields', () => {
    renderDefault({
      user_info: {
        given_name: '',
        school_name: '',
      },
    });

    screen.getByText('Add your full name');
    screen.getByText('Add your school');
    expect(
      screen.getByRole('button', {name: 'Join this workshop'})
    ).toBeDisabled();
  });
});
