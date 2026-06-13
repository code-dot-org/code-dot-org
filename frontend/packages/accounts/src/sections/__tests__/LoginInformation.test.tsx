import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';

import type {AccountSettings} from '../../api/accounts.types';
import {FormProvider} from '../../state/FormContext';
import LoginInformation from '../LoginInformation';

const BASE: AccountSettings = {
  userType: 'teacher',
  givenName: 'Ada',
  familyName: 'Lovelace',
  displayName: 'Ada Lovelace',
  username: 'ada_lovelace',
  email: 'ada@example.com',
  hasPassword: true,
  canEditEmail: true,
  canEditPassword: true,
  shouldSeeAddPasswordForm: false,
  shouldSeeEditEmailLink: true,
  authenticationOptions: [],
  canChangeUserType: true,
  canDeleteOwnAccount: true,
  age: '21+',
  usState: 'WA',
  dependentStudentsCount: 0,
};

function renderSection(overrides: Partial<AccountSettings>) {
  const settings = {...BASE, ...overrides};
  const client = createQueryClient({queries: {retry: false}});
  render(
    <QueryClientProvider client={client}>
      <FormProvider initialValues={{username: settings.username ?? ''}}>
        <LoginInformation settings={settings} />
      </FormProvider>
    </QueryClientProvider>,
  );
}

const createPassword = () =>
  screen.queryByRole('button', {name: 'Create password'});
const updatePassword = () =>
  screen.queryByRole('button', {name: 'Update password'});

describe('LoginInformation password affordances', () => {
  it('offers Update password when a password exists', () => {
    renderSection({hasPassword: true, canEditPassword: true});
    expect(updatePassword()).toBeInTheDocument();
    expect(createPassword()).toBeNull();
  });

  it('offers Create password only when the server grants the entitlement', () => {
    renderSection({
      hasPassword: false,
      shouldSeeAddPasswordForm: true,
      authenticationOptions: [
        {credentialType: 'google_oauth2', email: 'grace@example.com'},
      ],
    });
    expect(createPassword()).toBeInTheDocument();
    expect(updatePassword()).toBeNull();
    expect(screen.getByText(/signed in with google/i)).toBeInTheDocument();
  });

  it('offers no password action when SSO-only without the entitlement', () => {
    // e.g. an oauth-only student — legacy routes them to a personal-login flow,
    // not add-password.
    renderSection({
      userType: 'student',
      hasPassword: false,
      shouldSeeAddPasswordForm: false,
      authenticationOptions: [{credentialType: 'google_oauth2', email: null}],
    });
    expect(createPassword()).toBeNull();
    expect(updatePassword()).toBeNull();
    expect(screen.getByText(/signed in with google/i)).toBeInTheDocument();
  });

  it('shows the password-needed email hint only when a password exists', () => {
    renderSection({hasPassword: true});
    expect(
      screen.getByText('Your password is needed to update your email.'),
    ).toBeInTheDocument();
  });

  it('omits the password-needed email hint for password-less SSO accounts', () => {
    renderSection({
      hasPassword: false,
      shouldSeeAddPasswordForm: true,
      authenticationOptions: [
        {credentialType: 'google_oauth2', email: 'grace@example.com'},
      ],
    });
    expect(
      screen.queryByText('Your password is needed to update your email.'),
    ).toBeNull();
  });
});
