import {render, screen} from '@testing-library/react';
import React from 'react';

import EnrollInWorkshop from '@cdo/apps/code-studio/pd/workshops/components/EnrollInWorkshop';
import '@testing-library/jest-dom';

const baseProps = {
  id: 1,
  custom_registration_link: undefined,
  num_enrollments: 0,
  capacity: 10,
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
