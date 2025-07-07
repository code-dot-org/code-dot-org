import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {SessionFormat} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/types';
import EnrollInWorkshop from '@cdo/apps/code-studio/pd/workshops/components/EnrollInWorkshop';

const baseUserInfo = {
  is_student: false,
  id: 123,
  email: 'sample@google.com',
  display_name: 'Mr. Doe',
  first_name: 'John',
  last_name: 'Doe',
  school_info: {
    school_id: 1,
    country: 'United States',
    school_name: 'School Academy',
    zip: '11111',
  },
};

const baseProps = {
  id: 1,
  custom_registration_link: undefined,
  num_enrollments: 0,
  capacity: 10,
  userInfo: baseUserInfo,
  regional_partner_name: 'Sample Partner',
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
    render(<EnrollInWorkshop {...baseProps} num_enrollments={10} />);
    const fullButton = screen.getByRole('button', {name: /Workshop is full/i});
    expect(fullButton).toBeDisabled();
  });

  it('enroll button sends logged out users to logged out gate', () => {
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

  it('enroll button sends students to update account type gate', () => {
    render(
      <EnrollInWorkshop
        {...baseProps}
        userInfo={{...baseUserInfo, is_student: true}}
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

  it('shows partner registration link if custom_registration_link is present', () => {
    const customLink = 'https://partner.org/enroll';
    render(
      <EnrollInWorkshop {...baseProps} custom_registration_link={customLink} />
    );

    expect(
      screen.getByText(/This workshop’s registration is managed externally/i)
    ).toBeInTheDocument();

    const linkButton = screen.getByRole('link', {
      name: /Go to partner enrollment/i,
    });
    expect(linkButton).toHaveAttribute('href', customLink);
  });

  it('shows internal enrollment button if user is signed in and not a student', () => {
    render(<EnrollInWorkshop {...baseProps} />);
    const enrollButton = screen.getByRole('button', {
      name: /Enroll in this workshop/i,
    });
    expect(enrollButton).toBeInTheDocument();
    expect(enrollButton).toBeEnabled();
  });

  it('always shows "Click to see data sharing notice" link', () => {
    render(<EnrollInWorkshop {...baseProps} />);
    const link = screen.getByRole('link', {
      name: /Click to see data sharing notice/i,
    });
    expect(link).toHaveAttribute('href', '#data-sharing-notice');
  });
});
