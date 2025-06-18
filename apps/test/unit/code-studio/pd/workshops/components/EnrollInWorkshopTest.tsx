import {render, screen} from '@testing-library/react';
import React from 'react';

import EnrollInWorkshop from '@cdo/apps/code-studio/pd/workshops/components/EnrollInWorkshop';
import '@testing-library/jest-dom';

const baseProps = {
  id: 1,
  custom_registration_link: undefined,
  num_enrollments: 0,
  capacity: 10,
  is_signed_out: false,
  is_student: false,
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
    render(<EnrollInWorkshop {...baseProps} is_signed_out={true} />);
    const linkButton = screen.getByRole('link', {
      name: /Enroll in this workshop/i,
    });
    expect(linkButton).toHaveAttribute(
      'href',
      `/logged_out?source_page=${encodeURIComponent(
        'workshop enroll'
      )}&return_to=${encodeURIComponent('/pd/workshops/1/enroll')}`
    );
  });

  it('enroll button sends students to update account type gate', () => {
    render(<EnrollInWorkshop {...baseProps} is_student={true} />);
    const linkButton = screen.getByRole('link', {
      name: /Enroll in this workshop/i,
    });
    expect(linkButton).toHaveAttribute(
      'href',
      `/teacher_account_required?source_page=${encodeURIComponent(
        'workshop enroll'
      )}&return_to=${encodeURIComponent('/pd/workshops/1/enroll')}`
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

  it('shows internal enrollment link if available and not full', () => {
    render(<EnrollInWorkshop {...baseProps} />);
    const enrollLink = screen.getByRole('link', {
      name: /Enroll in this workshop/i,
    });
    expect(enrollLink).toHaveAttribute('href', '/pd/workshops/1/enroll');
  });

  it('always shows "Click to see data sharing notice" link', () => {
    render(<EnrollInWorkshop {...baseProps} />);
    const link = screen.getByRole('link', {
      name: /Click to see data sharing notice/i,
    });
    expect(link).toHaveAttribute('href', '#data-sharing-notice');
  });
});
