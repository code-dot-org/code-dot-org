import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it} from 'vitest';

import {ToastProvider} from '@code-dot-org/component-library/toast';
import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {UserSettings} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import UsersActions from '../UsersActions';

const BASE: UserSettings = {
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
  gender: null,
  isUsa: true,
  parentEmail: null,
  dependentStudentsCount: 0,
  ageOptions: [],
  usStateOptions: [],
};

function renderSection(overrides: Partial<UserSettings>) {
  const settings = {...BASE, ...overrides};
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      {/* politeness mirrors UsersSettingsPage, which owns the real provider. */}
      <ToastProvider politeness="polite">
        <UsersActions settings={settings} />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

const deleteButton = () =>
  screen.queryByRole('button', {name: /delete my account/i});
const cannotDeleteNote = () =>
  screen.queryByText(/do not have permission to delete this account/i);

describe('UsersActions delete affordance', () => {
  // Per the design the section is just the action; the consequences copy lives in
  // the dialog, and is asserted in DeleteUserModal.test.tsx.
  it('labels the action and offers an enabled Delete', () => {
    renderSection({canDeleteOwnAccount: true, userType: 'student'});
    expect(screen.getByText('Danger zone')).toBeInTheDocument();
    expect(deleteButton()).toBeEnabled();
    expect(
      screen.queryByText(/permanently erase all personal information/i),
    ).toBeNull();
    expect(cannotDeleteNote()).toBeNull();
  });

  it('labels the action and explains why instead of a disabled button when deletion is not allowed', () => {
    renderSection({canDeleteOwnAccount: false});
    expect(screen.getByText('Danger zone')).toBeInTheDocument();
    expect(deleteButton()).toBeNull();
    expect(cannotDeleteNote()).toBeInTheDocument();
  });
});

const sessionsButton = () =>
  screen.getByRole('button', {name: 'Sign Out All Other Sessions'});

describe('UsersActions manage other sessions', () => {
  it('offers the manage-other-sessions block to any user', () => {
    renderSection({canDeleteOwnAccount: false});
    expect(
      screen.getByRole('heading', {level: 3, name: 'Manage Other Sessions'}),
    ).toBeInTheDocument();
    expect(sessionsButton()).toBeInTheDocument();
  });

  it('confirms in an alertdialog before signing out', async () => {
    renderSection({});
    fireEvent.click(sessionsButton());
    expect(
      await screen.findByRole('alertdialog', {
        name: /sign out all other sessions/i,
      }),
    ).toBeInTheDocument();
  });

  it('signs out and announces success on confirm', async () => {
    mockServer.use(
      http.delete(
        '*/expire_other',
        () =>
          new HttpResponse('<html></html>', {
            status: 200,
            headers: {'content-type': 'text/html'},
          }),
      ),
      // signOutOtherSessions refreshes the CSRF token afterwards. Unhandled,
      // that GET only settles after ky's retry backoff (~1s), racing the
      // waitFor timeout below.
      http.get(
        '*/get_token',
        () =>
          new HttpResponse(null, {
            status: 200,
            headers: {'csrf-token': 'mock-csrf-token'},
          }),
      ),
    );
    renderSection({});
    fireEvent.click(sessionsButton());
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(dialog).getByRole('button', {name: 'Sign out all other sessions'}),
    );

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Signed out of all other sessions.',
      ),
    );
  });

  it('keeps the dialog open with an error when sign-out fails', async () => {
    mockServer.use(
      http.delete(
        '*/expire_other',
        () => new HttpResponse(null, {status: 500}),
      ),
    );
    renderSection({});
    fireEvent.click(sessionsButton());
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(dialog).getByRole('button', {name: 'Sign out all other sessions'}),
    );

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      /something went wrong/i,
    );
    expect(screen.queryByRole('status')).toBeNull();
  });
});
