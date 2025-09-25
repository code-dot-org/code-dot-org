import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {SessionFormat} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';
import EnrollInWorkshop from '@cdo/apps/code-studio/pd/workshops/components/EnrollInWorkshop';

const baseUserInfo = {
  isStudent: false,
  id: 123,
  email: 'sample@google.com',
  displayName: 'Mr. Doe',
  givenName: 'John',
  familyName: 'Doe',
  educatorRole: 'Homeschool Teacher',
  schoolInfo: {
    schoolId: 1,
    country: 'United States',
    schoolName: 'School Academy',
    zip: '11111',
    schoolType: undefined,
  },
};

const baseProps = {
  id: 1,
  customRegistrationLink: undefined,
  numEnrollments: 0,
  capacity: 10,
  userInfo: baseUserInfo,
  regionalPartnerName: 'Sample Partner',
  course: 'CS Principles',
  name: 'Sample Workshop',
  format: 'hybrid' as const,
  subject: 'Computer Science',
  sessions: [
    {
      id: 1,
      start: '2025-05-22T07:00:00.000Z',
      end: '2025-05-22T19:00:00.000Z',
      is_local: true,
      location_name: 'Kyiv, Intercontinental Hotel',
      location_address: '',
      meeting_link: '',
      session_format: 'in_person' as SessionFormat,
    },
  ],
};

describe('EnrollInWorkshop', () => {
  it('renders heading', () => {
    render(<EnrollInWorkshop {...baseProps} />);
    expect(
      screen.getByRole('heading', {name: /Enroll in this workshop/i})
    ).toBeInTheDocument();
  });

  it('shows "Workshop is full" button if full', () => {
    render(<EnrollInWorkshop {...baseProps} numEnrollments={10} />);
    const fullButton = screen.getByRole('button', {name: /Workshop is full/i});
    expect(fullButton).toBeDisabled();
  });

  it('enroll button is disabled if user information is missing', () => {
    const missingFirstNameUserInfo = {...baseUserInfo, givenName: ''};
    render(
      <EnrollInWorkshop {...baseProps} userInfo={missingFirstNameUserInfo} />
    );
    const enrollButton = screen.getByRole('button', {
      name: /Enroll in this workshop/i,
    });
    expect(enrollButton).toBeInTheDocument();
    expect(enrollButton).toBeDisabled();
  });

  it('enroll button is enabled if all user information is present', () => {
    render(<EnrollInWorkshop {...baseProps} />);
    const enrollButton = screen.getByRole('button', {
      name: /Enroll in this workshop/i,
    });
    expect(enrollButton).toBeInTheDocument();
    expect(enrollButton).toBeEnabled();
  });

  it('enroll button sends logged out users to logged out gate if workshop has no customRegistrationLink', () => {
    render(<EnrollInWorkshop {...baseProps} userInfo={null} />);
    const linkButton = screen.getByRole('link', {
      name: /Sign-in to enroll/i,
    });
    expect(linkButton).toHaveAttribute(
      'href',
      `/logged_out?source_page=${encodeURIComponent(
        'workshop enroll'
      )}&return_to=${encodeURIComponent('/professional-learning/workshops/1')}`
    );
  });

  it('enroll button sends students to update account type gate if workshop has no customRegistrationLink', () => {
    render(
      <EnrollInWorkshop
        {...baseProps}
        userInfo={{...baseUserInfo, isStudent: true}}
      />
    );
    const linkButton = screen.getByRole('link', {
      name: /Switch to teacher account/i,
    });
    expect(linkButton).toHaveAttribute(
      'href',
      `/teacher_account_required?source_page=${encodeURIComponent(
        'workshop enroll'
      )}&return_to=${encodeURIComponent('/professional-learning/workshops/1')}`
    );
  });

  it('shows internal enrollment button to teachers if workshop has no customRegistrationLink', () => {
    render(<EnrollInWorkshop {...baseProps} />);
    const enrollButton = screen.getByRole('button', {
      name: /Enroll in this workshop/i,
    });
    expect(enrollButton).toBeInTheDocument();
    expect(enrollButton).toBeEnabled();
  });

  it('enroll button sends signed-out users to partner registration link if customRegistrationLink is present', () => {
    const customLink = 'https://partner.org/enroll';
    render(
      <EnrollInWorkshop
        {...baseProps}
        userInfo={null}
        customRegistrationLink={customLink}
      />
    );

    expect(
      screen.getByText(/This workshop's registration is managed externally/i)
    ).toBeInTheDocument();

    const linkButton = screen.getByRole('link', {
      name: /Go to partner enrollment/i,
    });
    expect(linkButton).toHaveAttribute('href', customLink);
  });

  it('enroll button sends student users to partner registration link if customRegistrationLink is present', () => {
    const customLink = 'https://partner.org/enroll';
    render(
      <EnrollInWorkshop
        {...baseProps}
        userInfo={{...baseUserInfo, isStudent: true}}
        customRegistrationLink={customLink}
      />
    );

    expect(
      screen.getByText(/This workshop's registration is managed externally/i)
    ).toBeInTheDocument();

    const linkButton = screen.getByRole('link', {
      name: /Go to partner enrollment/i,
    });
    expect(linkButton).toHaveAttribute('href', customLink);
  });

  it('enroll button sends teachers users to partner registration link if customRegistrationLink is present', () => {
    const customLink = 'https://partner.org/enroll';
    render(
      <EnrollInWorkshop {...baseProps} customRegistrationLink={customLink} />
    );

    expect(
      screen.getByText(/This workshop's registration is managed externally/i)
    ).toBeInTheDocument();

    const linkButton = screen.getByRole('link', {
      name: /Go to partner enrollment/i,
    });
    expect(linkButton).toHaveAttribute('href', customLink);
  });

  it('always shows "Click to see data sharing notice" link', () => {
    render(<EnrollInWorkshop {...baseProps} />);
    const link = screen.getByRole('link', {
      name: /Click to see data sharing notice/i,
    });
    expect(link).toHaveAttribute('href', '#data-sharing-notice');
  });
});
