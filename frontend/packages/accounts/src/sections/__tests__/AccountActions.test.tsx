import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';

import type {AccountSettings} from '../../api/accounts.types';
import AccountActions from '../AccountActions';

const BASE: AccountSettings = {
  userType: 'student',
  givenName: 'Sam',
  familyName: null,
  displayName: 'Sam',
  username: 'sam',
  email: null,
  hasPassword: true,
  canEditEmail: false,
  canEditPassword: true,
  shouldSeeAddPasswordForm: false,
  shouldSeeEditEmailLink: false,
  authenticationOptions: [],
  canChangeUserType: false,
  canDeleteOwnAccount: true,
  age: 14,
  usState: 'WA',
  dependentStudentsCount: 0,
};

function renderSection(overrides: Partial<AccountSettings>) {
  const settings = {...BASE, ...overrides};
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <AccountActions settings={settings} />
    </QueryClientProvider>,
  );
}

const deleteButton = () =>
  screen.queryByRole('button', {name: /delete my account/i});
const cannotDeleteNote = () =>
  screen.queryByText(/do not have permission to delete this account/i);
const deleteHeading = () =>
  screen.queryByRole('heading', {level: 3, name: 'Delete account'});

describe('AccountActions delete affordance', () => {
  it('labels the action and offers an enabled Delete with a consequences warning', () => {
    renderSection({canDeleteOwnAccount: true, userType: 'student'});
    expect(deleteHeading()).toBeInTheDocument();
    expect(deleteButton()).toBeEnabled();
    expect(
      screen.getByText(/permanently erase all personal information/i),
    ).toBeInTheDocument();
    expect(cannotDeleteNote()).toBeNull();
  });

  it('warns teachers that deletion also removes their sections and students', () => {
    renderSection({canDeleteOwnAccount: true, userType: 'teacher'});
    expect(
      screen.getByText(/delete your sections and your students/i),
    ).toBeInTheDocument();
  });

  it('labels the action and explains why instead of a disabled button when deletion is not allowed', () => {
    renderSection({canDeleteOwnAccount: false});
    expect(deleteHeading()).toBeInTheDocument();
    expect(deleteButton()).toBeNull();
    expect(cannotDeleteNote()).toBeInTheDocument();
  });
});
