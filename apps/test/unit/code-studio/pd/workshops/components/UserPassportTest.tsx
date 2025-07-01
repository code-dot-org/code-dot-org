import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import UserPassport from '@cdo/apps/code-studio/pd/workshops/components/UserPassport';

const DEFAULT_PROPS = {
  displayName: 'Ms. McEntire',
  givenName: 'Reba',
  familyName: 'McEntire',
  email: 'reba@mcentire.com',
  schoolName: 'Sample School Name',
  returnToHref: '/fake-return-url',
  className: '',
};

const renderDefault = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  render(<UserPassport {...props} />);
};

describe('UserPassport', () => {
  it('having all params shows user info', () => {
    renderDefault();

    screen.getByText('Full name');
    screen.getByText(`${DEFAULT_PROPS.givenName} ${DEFAULT_PROPS.familyName}`);
    screen.getByText('Email');
    screen.getByText(DEFAULT_PROPS.email);
    screen.getByText('School');
    screen.getByText(DEFAULT_PROPS.schoolName);
  });

  it('missing name or school shows error messages', () => {
    renderDefault({givenName: '', schoolName: ''});

    screen.getByText('Full name');
    screen.getByText('Add your full name');
    screen.getByText('School');
    screen.getByText('Add your school');
  });

  it('edit link sends user to account settings page with return_to url', () => {
    renderDefault();
    expect(screen.getByRole('link', {name: 'Edit'})).toHaveAttribute(
      'href',
      '/users/edit?user_return_to=/fake-return-url'
    );
  });
});
