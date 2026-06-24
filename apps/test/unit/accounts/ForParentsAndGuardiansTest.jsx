import {render, screen} from '@testing-library/react';
import React from 'react';

import ForParentsAndGuardians from '@cdo/apps/accounts/ForParentsAndGuardians';

describe('ForParentsAndGuardians', () => {
  const defaultProps = {
    heading: 'For Parents and Guardians',
    intro: 'Link a parent/guardian email address.',
    emailLabel: 'Parent/guardian email',
    currentEmail: 'None',
    updateLabel: 'Update',
    hasParentEmail: false,
    orLabel: 'or',
    removeLabel: 'Remove',
    note: 'Only one parent email is supported.',
  };

  it('renders the heading, intro, current email, note, and Update link', () => {
    render(<ForParentsAndGuardians {...defaultProps} />);

    screen.getByRole('heading', {name: 'For Parents and Guardians'});
    screen.getByText('Link a parent/guardian email address.');
    screen.getByText('None');
    screen.getByText('Only one parent email is supported.');
    // The Update link keeps the id the controller attaches to.
    expect(screen.getByRole('button', {name: 'Update'})).toHaveAttribute(
      'id',
      'add-parent-email-link'
    );
  });

  it('renders the Remove link when a parent email exists', () => {
    render(
      <ForParentsAndGuardians
        {...defaultProps}
        hasParentEmail
        currentEmail="parent@example.com"
      />
    );

    expect(screen.getByRole('button', {name: 'Remove'})).toHaveAttribute(
      'id',
      'remove-parent-email-link'
    );
  });

  it('omits the Remove link when there is no parent email', () => {
    render(<ForParentsAndGuardians {...defaultProps} />);
    expect(
      screen.queryByRole('button', {name: 'Remove'})
    ).not.toBeInTheDocument();
  });
});
