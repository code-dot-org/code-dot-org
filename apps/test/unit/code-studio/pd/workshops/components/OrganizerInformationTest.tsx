import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import OrganizerInformation from '@cdo/apps/code-studio/pd/workshops/components/OrganizerInformation';

describe('OrganizerInformation', () => {
  const organizer = {
    name: 'WS Admin',
    email: 'ws-admin@gmail.com',
  };

  const setup = (props = {}) =>
    render(
      <OrganizerInformation
        organizer={organizer}
        regionalPartnerName="The Best Regional Partner"
        {...props}
      />
    );

  it('renders heading', () => {
    setup();
    expect(
      screen.getByRole('heading', {name: /organizer information/i})
    ).toBeInTheDocument();
  });

  it('renders organizer name', () => {
    setup();
    expect(screen.getByText(/ws admin/i)).toBeInTheDocument();
  });

  it('renders organizer email as mailto link', () => {
    setup();
    const emailLink = screen.getByRole('link', {
      name: organizer.email,
    });
    expect(emailLink).toHaveAttribute('href', `mailto:${organizer.email}`);
  });

  it('renders regional partner name', () => {
    setup();
    expect(screen.getByText(/The Best Regional Partner/i)).toBeInTheDocument();
  });

  it('does not render regional partner name if not provided', () => {
    setup({regionalPartnerName: undefined});
    expect(screen.queryByText(/regional partner:/i)).not.toBeInTheDocument();
  });
});
