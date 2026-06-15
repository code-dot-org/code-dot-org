import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {UserSettings} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import {ToastProvider} from '../../components/Toast';
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
  parentEmail: null,
  dependentStudentsCount: 0,
  ageOptions: [],
  usStateOptions: [],
};

function renderSection(overrides: Partial<UserSettings>) {
  const settings = {...BASE, ...overrides};
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <ToastProvider>
        <UsersActions settings={settings} />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

const deleteButton = () =>
  screen.queryByRole('button', {name: /delete my account/i});
const cannotDeleteNote = () =>
  screen.queryByText(/do not have permission to delete this account/i);
const deleteHeading = () =>
  screen.queryByRole('heading', {level: 3, name: 'Delete account'});

describe('UsersActions delete affordance', () => {
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
