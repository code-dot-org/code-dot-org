import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import UserPassport from '@cdo/apps/code-studio/pd/workshops/components/UserPassport';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

const DEFAULT_PROPS = {
  displayName: 'Ms. McEntire',
  givenName: 'Reba',
  familyName: 'McEntire',
  email: 'reba@mcentire.com',
  educatorRole: 'Homeschool Teacher',
  schoolName: 'Sample School Name',
  schoolType: undefined,
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

  it('missing name or role or school shows error messages', () => {
    renderDefault({
      givenName: '',
      educatorRole: '',
      schoolName: '',
      schoolType: '',
    });

    screen.getByText('Full name');
    screen.getByText('Add your full name');
    screen.getByText('Role');
    screen.getByText('Add your role');
    screen.getByText('School');
    screen.getByText('Add your school');
  });

  it('not teaching in a school setting does not show error message', () => {
    renderDefault({
      schoolName: '',
      schoolType: NonSchoolOptions.NO_SCHOOL_SETTING,
    });

    screen.getByText('School');
    screen.getByText('Non-School Setting');
    expect(screen.queryByText('Add your school')).toBe(null);
  });

  it('edit link adds missing info params to url: missing role', () => {
    renderDefault({educatorRole: ''});

    expect(
      screen.getByRole('link', {
        name: 'Edit',
      })
    ).toHaveAttribute(
      'href',
      `/users/edit?user_return_to=${encodeURIComponent(
        DEFAULT_PROPS.returnToHref
      )}&accountInformation=true`
    );
  });

  it('edit link adds missing info params to url: missing full name', () => {
    renderDefault({givenName: ''});

    expect(
      screen.getByRole('link', {
        name: 'Edit',
      })
    ).toHaveAttribute(
      'href',
      `/users/edit?user_return_to=${encodeURIComponent(
        DEFAULT_PROPS.returnToHref
      )}&accountInformation=true`
    );
  });

  it('edit link adds missing info params to url: missing school', () => {
    renderDefault({schoolName: '', schoolType: ''});

    expect(
      screen.getByRole('link', {
        name: 'Edit',
      })
    ).toHaveAttribute(
      'href',
      `/users/edit?user_return_to=${encodeURIComponent(
        DEFAULT_PROPS.returnToHref
      )}&schoolInformation=true`
    );
  });

  it('edit link adds missing info params to url: missing full name and school', () => {
    renderDefault({familyName: '', schoolName: '', schoolType: ''});

    expect(
      screen.getByRole('link', {
        name: 'Edit',
      })
    ).toHaveAttribute(
      'href',
      `/users/edit?user_return_to=${encodeURIComponent(
        DEFAULT_PROPS.returnToHref
      )}&accountInformation=true&schoolInformation=true`
    );
  });

  it('edit link just has return_to url param if user has all required fields', () => {
    renderDefault();

    expect(
      screen.getByRole('link', {
        name: 'Edit',
      })
    ).toHaveAttribute(
      'href',
      `/users/edit?user_return_to=${encodeURIComponent(
        DEFAULT_PROPS.returnToHref
      )}`
    );
  });
});
