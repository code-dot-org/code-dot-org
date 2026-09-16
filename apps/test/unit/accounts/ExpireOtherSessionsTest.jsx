import {render, screen} from '@testing-library/react';
import React from 'react';

import ExpireOtherSessions from '@cdo/apps/accounts/ExpireOtherSessions';

describe('ExpireOtherSessions', () => {
  const defaultProps = {
    expirePath: '/expire_other',
    heading: 'Manage Other Sessions',
    description: 'Sign out of other browsers and devices.',
    buttonLabel: 'Sign Out All Other Sessions',
  };

  it('renders the heading, description, and submit button', () => {
    render(<ExpireOtherSessions {...defaultProps} />);
    screen.getByRole('heading', {name: 'Manage Other Sessions'});
    screen.getByText('Sign out of other browsers and devices.');
    screen.getByRole('button', {name: 'Sign Out All Other Sessions'});
  });

  it('submits a Rails DELETE form to the expire path', () => {
    render(<ExpireOtherSessions {...defaultProps} />);
    const form = screen
      .getByRole('button', {name: 'Sign Out All Other Sessions'})
      .closest('form');
    expect(form).toHaveAttribute('action', '/expire_other');
    expect(form).toHaveAttribute('method', 'post');
  });
});
