import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it, vi} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import type {UserSettings} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import DeleteUserModal from '../DeleteUserModal';

const STUDENT: UserSettings = {
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

const DEPENDENT_TEACHER: UserSettings = {
  ...STUDENT,
  userType: 'teacher',
  hasPassword: true,
  dependentStudentsCount: 2,
};

const VERIFICATION = 'DELETE MY ACCOUNT';

function renderModal(settings: UserSettings, onClose = vi.fn()) {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <DeleteUserModal open onClose={onClose} settings={settings} />
    </QueryClientProvider>,
  );
  return onClose;
}

const deleteButton = () =>
  screen.getByRole('button', {name: 'Delete my account'});
const verificationField = () =>
  screen.queryByRole('textbox', {name: /delete my account/i});
const passwordField = () =>
  screen.getByLabelText(/password/i) as HTMLInputElement;

describe('DeleteUserModal — dependent teacher (education-records safeguards)', () => {
  it('renders the teacher warning and all five acknowledgments verbatim', () => {
    renderModal(DEPENDENT_TEACHER);

    expect(
      screen.getByText(/It will also delete your sections and your students/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Please make sure you have the authority to delete these students’ education records/,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/I have the authority to delete the education records/),
    ).toBeInTheDocument();
    expect(screen.getByText(/I am aware of the/)).toBeInTheDocument();
    expect(
      screen.getByText(/my students’ accounts may also be permanently deleted/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /my students may not be able to access their accounts anymore/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /the projects and creations of my students may also be deleted/,
      ),
    ).toBeInTheDocument();

    // External help links open in a new tab.
    const learnMore = screen.getByRole('link', {name: /learn more/i});
    expect(learnMore).toHaveAttribute(
      'href',
      'https://support.code.org/hc/en-us/articles/360015983631',
    );
    expect(learnMore).toHaveAttribute('target', '_blank');
    expect(learnMore).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByRole('link', {name: /message to send to parents/i}),
    ).toHaveAttribute(
      'href',
      'https://support.code.org/hc/en-us/articles/115001475131-Adding-a-personal-login-to-a-teacher-created-account',
    );
  });

  it('renders five checkboxes and a verification field', () => {
    renderModal(DEPENDENT_TEACHER);
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    expect(verificationField()).toBeInTheDocument();
  });

  it('keeps Delete disabled until all five are checked, the exact string is typed, and a password is entered', () => {
    renderModal(DEPENDENT_TEACHER);
    const checkboxes = screen.getAllByRole('checkbox');

    expect(deleteButton()).toBeDisabled();

    // 4/5 checked is not enough.
    checkboxes.slice(0, 4).forEach(box => fireEvent.click(box));
    fireEvent.change(verificationField()!, {target: {value: VERIFICATION}});
    fireEvent.change(passwordField(), {target: {value: 'pw'}});
    expect(deleteButton()).toBeDisabled();

    // All five checked, but wrong verification string.
    fireEvent.click(checkboxes[4]);
    fireEvent.change(verificationField()!, {
      target: {value: 'delete my account'},
    });
    expect(deleteButton()).toBeDisabled();

    // All five checked, exact string, but no password.
    fireEvent.change(verificationField()!, {target: {value: VERIFICATION}});
    fireEvent.change(passwordField(), {target: {value: ''}});
    expect(deleteButton()).toBeDisabled();

    // Everything satisfied.
    fireEvent.change(passwordField(), {target: {value: 'pw'}});
    expect(deleteButton()).toBeEnabled();
  });

  it('submits the password to DELETE /users once all safeguards are satisfied', async () => {
    let body: unknown;
    let called = false;
    mockServer.use(
      http.delete('*/users', async ({request}) => {
        called = true;
        body = await request.json();
        return new HttpResponse(null, {status: 204});
      }),
    );
    // jsdom's window.location.assign is non-configurable; stub the whole object.
    const original = window.location;
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...original, assign},
    });

    try {
      renderModal(DEPENDENT_TEACHER);
      screen.getAllByRole('checkbox').forEach(box => fireEvent.click(box));
      fireEvent.change(verificationField()!, {target: {value: VERIFICATION}});
      fireEvent.change(passwordField(), {target: {value: 'currentpass'}});
      fireEvent.click(deleteButton());

      await waitFor(() => expect(called).toBe(true));
      expect(body).toEqual({password_confirmation: 'currentpass'});
      await waitFor(() => expect(assign).toHaveBeenCalledWith('/'));
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: original,
      });
    }
  });
});

describe('DeleteUserModal — non-dependent user (single-checkbox gating)', () => {
  it('shows only the single acknowledgment, no verification field, no five checkboxes', () => {
    renderModal(STUDENT);
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(
      screen.getByText('I understand this is permanent.'),
    ).toBeInTheDocument();
    expect(verificationField()).toBeNull();
    expect(
      screen.queryByText(
        /I have the authority to delete the education records/,
      ),
    ).toBeNull();
  });

  it('enables Delete with the single checkbox plus a password', () => {
    renderModal(STUDENT);
    expect(deleteButton()).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(deleteButton()).toBeDisabled();
    fireEvent.change(passwordField(), {target: {value: 'pw'}});
    expect(deleteButton()).toBeEnabled();
  });

  it('treats a teacher with zero dependents as non-dependent', () => {
    renderModal({...STUDENT, userType: 'teacher', dependentStudentsCount: 0});
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(verificationField()).toBeNull();
  });
});
