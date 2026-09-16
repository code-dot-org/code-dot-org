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
  gender: null,
  isUsa: true,
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

const deleteButton = () => screen.getByRole('button', {name: /^Delete my/});

// A teacher depended upon for login lands on the guidance step first; the
// confirmation gates only exist past it.
const passGuidance = () =>
  fireEvent.click(screen.getByRole('button', {name: 'Next'}));
const verificationField = () =>
  screen.queryByRole('textbox', {name: /delete my account/i});
const passwordField = () =>
  screen.getByLabelText(/password/i) as HTMLInputElement;

describe('DeleteUserModal — dependent teacher (education-records safeguards)', () => {
  it('renders the teacher warning and all five acknowledgments verbatim', () => {
    renderModal(DEPENDENT_TEACHER);
    passGuidance();

    expect(screen.getByRole('alertdialog').textContent ?? '').toMatch(
      /delete your sections and your students’ accounts/,
    );

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
    passGuidance();
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    expect(verificationField()).toBeInTheDocument();
  });

  it('keeps Delete disabled until all five are checked, the exact string is typed, and a password is entered', () => {
    renderModal(DEPENDENT_TEACHER);
    passGuidance();
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
      passGuidance();
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

describe('DeleteUserModal — parity gates', () => {
  const SSO_NO_PASSWORD: UserSettings = {...STUDENT, hasPassword: false};

  it('requires the typed confirmation even without dependents or a password', () => {
    renderModal(SSO_NO_PASSWORD);
    expect(
      screen.getByLabelText(`To verify, type ${VERIFICATION} below:`),
    ).toBeInTheDocument();
    expect(deleteButton()).toBeDisabled();
  });

  it('enables delete for an ordinary account only once the string is typed', () => {
    renderModal(STUDENT);
    fireEvent.change(screen.getByLabelText('Current password:'), {
      target: {value: 'hunter2'},
    });
    expect(deleteButton()).toBeDisabled();
    fireEvent.change(
      screen.getByLabelText(`To verify, type ${VERIFICATION} below:`),
      {target: {value: VERIFICATION}},
    );
    expect(deleteButton()).toBeEnabled();
  });

  it('shows no acknowledgment checkboxes for an account without dependents', () => {
    renderModal(STUDENT);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByText(/I understand this is permanent/)).toBeNull();
  });

  it('does not delete on Enter — the confirm button is not a submit button', async () => {
    let deleted = false;
    mockServer.use(
      http.delete('*/users', () => {
        deleted = true;
        return new HttpResponse(null, {status: 204});
      }),
    );
    renderModal(STUDENT);
    const verify = screen.getByLabelText(
      `To verify, type ${VERIFICATION} below:`,
    );
    fireEvent.change(screen.getByLabelText('Current password:'), {
      target: {value: 'hunter2'},
    });
    fireEvent.change(verify, {target: {value: VERIFICATION}});
    expect(deleteButton()).toBeEnabled();
    expect(deleteButton()).not.toHaveAttribute('type', 'submit');

    fireEvent.submit(verify.closest('form') as HTMLFormElement);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(deleted).toBe(false);
  });
});

describe('DeleteUserModal — restored copy', () => {
  it('asks rather than restating the trigger, and states the recovery window', () => {
    renderModal(STUDENT);
    expect(
      screen.getByText('Are you sure you want to delete your account?'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/email us at support@code\.org within 3 weeks/),
    ).toBeInTheDocument();
  });

  it('states what unlocks delete, pluralized, for a dependent teacher', () => {
    renderModal(DEPENDENT_TEACHER);
    passGuidance();
    expect(
      screen.getByText(
        'Please verify the following 5 statements before you can delete your account:',
      ),
    ).toBeInTheDocument();
  });

  it('hedges the dependent count instead of asserting it', () => {
    renderModal(DEPENDENT_TEACHER);
    expect(screen.getByText(/2 or more students/)).toBeInTheDocument();
    expect(screen.queryByText(/the 2 dependent student accounts/)).toBeNull();
  });

  it('names the wider consequence on the button when students are affected', () => {
    renderModal(DEPENDENT_TEACHER);
    passGuidance();
    expect(
      screen.getByRole('button', {
        name: "Delete my and my students' accounts",
      }),
    ).toBeInTheDocument();
  });

  // The section no longer carries consequences copy — the dialog owns it, so the
  // teacher/student split has to be asserted here.
  it('varies the erasure warning by account type', () => {
    renderModal(DEPENDENT_TEACHER);
    passGuidance();
    expect(
      screen.getByText(
        /professional learning information linked to this account/,
      ),
    ).toBeInTheDocument();
  });

  it('omits professional-learning wording for a student', () => {
    renderModal(STUDENT);
    expect(
      screen.getByText(/coursework, and projects linked to this account/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/professional learning/)).toBeNull();
  });

  // The section is only the button now, so the dialog has to carry the whole
  // teacher disclaimer — including for a teacher with no dependent students, who
  // sees neither the guidance step nor the acknowledgments.
  it('tells every teacher their sections go and that they need records authority', () => {
    renderModal({...STUDENT, userType: 'teacher'});
    const text = screen.getByRole('alertdialog').textContent ?? '';
    expect(text).toMatch(
      /delete your sections and your students’ accounts that don’t have a personal login or aren’t in another teacher’s section/,
    );
    expect(text).toMatch(
      /authority to delete these students’ education records/,
    );
  });

  it('does not aim the teacher disclaimer at students', () => {
    renderModal(STUDENT);
    const text = screen.getByRole('alertdialog').textContent ?? '';
    expect(text).not.toMatch(/delete your sections/);
    expect(text).not.toMatch(/authority to delete these students/);
  });

  it('warns in a danger alert', () => {
    renderModal(STUDENT);
    expect(screen.getByText(/permanently erase/)).toBeInTheDocument();
  });
});

describe('DeleteUserModal — personal-login guidance step', () => {
  it('makes a dependent teacher pass a guidance step before the confirmation', () => {
    renderModal(DEPENDENT_TEACHER);
    expect(screen.getByText(/2 or more students/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Send home instructions for creating a personal login',
      }),
    ).toBeInTheDocument();
    // The confirmation gates are not reachable until Next is pressed.
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
  });

  it('sends an account without dependents straight to the confirmation', () => {
    renderModal(STUDENT);
    expect(screen.queryByRole('button', {name: 'Next'})).toBeNull();
    expect(
      screen.getByLabelText(`To verify, type ${VERIFICATION} below:`),
    ).toBeInTheDocument();
  });
});
