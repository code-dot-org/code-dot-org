import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {afterEach, describe, expect, it} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import AccountSettingsPage from '../AccountSettingsPage';
import {
  ACCOUNTS_LAB_KEY,
  registerAccountsFixtures,
  resetAccountsFixtures,
} from '../fixtures';

function renderPage(tag: string) {
  registerAccountsFixtures();
  setActiveScenario({labKey: ACCOUNTS_LAB_KEY, tag});
  const client = createQueryClient({queries: {retry: false}});
  return render(
    <QueryClientProvider client={client}>
      <AccountSettingsPage tab="account-details" onTabChange={() => {}} />
    </QueryClientProvider>,
  );
}

afterEach(() => resetAccountsFixtures());

describe('AccountSettingsPage', () => {
  it('shows a loading state, then the page heading, tabs, and sections (teacher)', async () => {
    renderPage('teacher');

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');

    const tablist = await screen.findByRole('tablist');
    expect(
      screen.getByRole('heading', {level: 1, name: 'My Account'}),
    ).toBeInTheDocument();
    expect(document.title).toBe('My Account — Code.org');

    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toBeDisabled();

    for (const name of [
      'My Information',
      'Login Information',
      'Account Actions',
    ]) {
      expect(screen.getByRole('heading', {level: 2, name})).toBeInTheDocument();
    }
  });

  it('renders the student variant without a last name', async () => {
    renderPage('student');
    await screen.findByRole('heading', {level: 2, name: 'My Information'});
    expect(screen.queryByText('Last name')).not.toBeInTheDocument();
  });

  it('hides the educator-only Educator Profile tab for students', async () => {
    // Students hide Educator Profile; Communications and Integrations still apply.
    renderPage('student');
    const tablist = await screen.findByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(
      within(tablist).queryByRole('tab', {name: 'Educator Profile'}),
    ).toBeNull();
    expect(
      within(tablist).getByRole('tab', {name: 'Account Details'}),
    ).toBeInTheDocument();
  });

  it('shows an error with a retry control when settings fail to load', async () => {
    registerAccountsFixtures();
    setActiveScenario({labKey: ACCOUNTS_LAB_KEY, tag: 'teacher'});
    mockServer.use(
      http.get(
        '*/api/v1/account/settings',
        () => new HttpResponse(null, {status: 500}),
      ),
    );
    const client = createQueryClient({queries: {retry: false}});
    render(
      <QueryClientProvider client={client}>
        <AccountSettingsPage tab="account-details" onTabChange={() => {}} />
      </QueryClientProvider>,
    );

    const alert = await screen.findByRole('alert');
    expect(
      within(alert).getByRole('button', {name: 'Try again'}),
    ).toBeInTheDocument();
  });
});

describe('AccountSettingsPage save flow', () => {
  it('reveals the save bar on edit, then clears it after a successful save', async () => {
    renderPage('teacher');
    const displayName = await screen.findByLabelText(/Display name/);

    fireEvent.change(displayName, {target: {value: 'Dr. Ada'}});

    const save = await screen.findByRole('button', {name: 'Save changes'});
    expect(screen.getByText('You’ve made some changes.')).toBeInTheDocument();

    fireEvent.click(save);

    // The toast confirms the save; the bar just clears (no redundant message).
    await waitFor(() =>
      expect(
        screen.queryByRole('button', {name: 'Save changes'}),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByText('You’ve made some changes.'),
    ).not.toBeInTheDocument();
  });

  it('shows a success toast after a profile save', async () => {
    renderPage('teacher');
    const displayName = await screen.findByLabelText(/Display name/);

    fireEvent.change(displayName, {target: {value: 'Dr. Ada'}});
    fireEvent.click(await screen.findByRole('button', {name: 'Save changes'}));

    expect(await screen.findByText('Changes saved.')).toBeInTheDocument();
  });

  it('does not save when submitted with no net changes', async () => {
    // Edit-then-revert leaves the save bar up but nothing dirty. Saving then
    // must skip the request: a bare {user:{}} 400s as ParameterMissing: user.
    renderPage('teacher');
    const displayName = await screen.findByLabelText(/Display name/);
    const original = (displayName as HTMLInputElement).value;

    fireEvent.change(displayName, {target: {value: `${original} edited`}});
    const save = await screen.findByRole('button', {name: 'Save changes'});
    fireEvent.change(displayName, {target: {value: original}});

    fireEvent.click(save);

    await waitFor(() =>
      expect(screen.queryByText('Changes saved.')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('You’ve made some changes.')).toBeInTheDocument();
  });

  it('shows a server field error and keeps the value on a 422', async () => {
    renderPage('teacher');
    mockServer.use(
      http.patch(
        '*/dashboardapi/users',
        () =>
          new HttpResponse(
            JSON.stringify({name: ['Display name is too long']}),
            {
              status: 422,
              headers: {'content-type': 'application/json'},
            },
          ),
      ),
    );
    const displayName = await screen.findByLabelText(/Display name/);

    fireEvent.change(displayName, {target: {value: 'x'.repeat(80)}});
    fireEvent.click(await screen.findByRole('button', {name: 'Save changes'}));

    expect(
      await screen.findByText('Display name is too long'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText(/Display name/)).toHaveAttribute(
        'aria-invalid',
        'true',
      ),
    );
  });
});

describe('AccountSettingsPage — Login Information', () => {
  it('updates the email through a modal that closes on success and reflects the new value', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');

    fireEvent.click(screen.getByRole('button', {name: 'Update email'}));
    const dialog = await screen.findByRole('dialog', {name: /update email/i});
    fireEvent.change(within(dialog).getByLabelText(/new email/i), {
      target: {value: 'ada@newschool.org'},
    });
    fireEvent.change(within(dialog).getByLabelText(/current password/i), {
      target: {value: 'currentpass'},
    });
    fireEvent.click(
      within(dialog).getByRole('button', {name: /update email/i}),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByDisplayValue('ada@newschool.org'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Email updated.')).toBeInTheDocument();
  });

  it('keeps the update-password modal open with the server error on a wrong current password', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');

    fireEvent.click(screen.getByRole('button', {name: 'Update password'}));
    const dialog = await screen.findByRole('dialog', {
      name: /update password/i,
    });
    fireEvent.change(within(dialog).getByLabelText(/current password/i), {
      target: {value: 'wrong'},
    });
    fireEvent.change(within(dialog).getByLabelText('New password'), {
      target: {value: 'newpassword1'},
    });
    fireEvent.change(within(dialog).getByLabelText(/confirm/i), {
      target: {value: 'newpassword1'},
    });
    fireEvent.click(
      within(dialog).getByRole('button', {name: /update password/i}),
    );

    expect(
      await within(dialog).findByText('Current password is invalid'),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes a modal on Escape without submitting', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');

    fireEvent.click(screen.getByRole('button', {name: 'Update email'}));
    const dialog = await screen.findByRole('dialog');
    fireEvent.keyDown(dialog, {key: 'Escape'});

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('masks a student email as ***encrypted*** but can still update it', async () => {
    renderPage('student');
    await screen.findByRole('tablist');

    expect(screen.getByDisplayValue('***encrypted***')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Update email'}),
    ).toBeInTheDocument();
  });
});

describe('AccountSettingsPage — SSO variant', () => {
  it('shows the SSO provider and a Create password action, not Update password', async () => {
    renderPage('sso-teacher');
    await screen.findByRole('tablist');

    expect(screen.getByText(/signed in with google/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /create password/i}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Update password'}),
    ).not.toBeInTheDocument();
  });

  it('creates a password through a modal that closes on success', async () => {
    renderPage('sso-teacher');
    await screen.findByRole('tablist');

    fireEvent.click(screen.getByRole('button', {name: /create password/i}));
    const dialog = await screen.findByRole('dialog', {
      name: /create password/i,
    });
    fireEvent.change(within(dialog).getByLabelText('New password'), {
      target: {value: 'newpassword1'},
    });
    fireEvent.change(within(dialog).getByLabelText(/confirm/i), {
      target: {value: 'newpassword1'},
    });
    fireEvent.click(
      within(dialog).getByRole('button', {name: /create password/i}),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('offers no password action for an oauth-only student (no entitlement)', async () => {
    renderPage('sso-student');
    await screen.findByRole('tablist');

    expect(screen.getByText(/signed in with google/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /create password/i}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Update password'}),
    ).not.toBeInTheDocument();
  });
});

describe('AccountSettingsPage — Account Actions', () => {
  it('confirms an account-type change in an alertdialog and reverts the dropdown on cancel', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');

    const select = screen.getByRole('combobox', {name: /account type/i});
    fireEvent.change(select, {target: {value: 'student'}});

    const dialog = await screen.findByRole('alertdialog', {
      name: /change account type/i,
    });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', {name: /cancel/i}));
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('combobox', {name: /account type/i})).toHaveValue(
      'teacher',
    );
  });

  it('keeps the account-type dialog open with an error when the change fails', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');
    mockServer.use(
      http.patch(
        '*/users/user_type',
        () => new HttpResponse(null, {status: 500}),
      ),
    );

    fireEvent.change(screen.getByRole('combobox', {name: /account type/i}), {
      target: {value: 'student'},
    });
    const dialog = await screen.findByRole('alertdialog', {
      name: /change account type/i,
    });
    fireEvent.click(
      within(dialog).getByRole('button', {name: /change to student/i}),
    );

    expect(await within(dialog).findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('hides the account-type control when the user cannot change type', async () => {
    renderPage('student');
    await screen.findByRole('tablist');
    expect(
      screen.queryByRole('combobox', {name: /account type/i}),
    ).not.toBeInTheDocument();
  });

  it('opens a delete alertdialog with the dependent-students warning and a self-describing button', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');

    fireEvent.click(screen.getByRole('button', {name: /delete my account/i}));
    const dialog = await screen.findByRole('alertdialog', {name: /delete/i});
    expect(within(dialog).getByText(/2.*student/i)).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', {name: /delete my account/i}),
    ).toBeInTheDocument();
  });

  it('shows the server error in the delete dialog on a wrong password', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');

    fireEvent.click(screen.getByRole('button', {name: /delete my account/i}));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.change(within(dialog).getByLabelText(/password/i), {
      target: {value: 'wrong'},
    });
    fireEvent.click(within(dialog).getByRole('checkbox'));
    fireEvent.click(
      within(dialog).getByRole('button', {name: /delete my account/i}),
    );
    expect(
      await within(dialog).findByText('Current password is invalid'),
    ).toBeInTheDocument();
  });
});

describe('AccountSettingsPage — student variant', () => {
  it('shows age and US state for a student and excludes last name', async () => {
    renderPage('student');
    await screen.findByRole('heading', {level: 2, name: 'My Information'});

    expect(screen.getByRole('combobox', {name: /^age$/i})).toBeInTheDocument();
    expect(screen.getByRole('combobox', {name: /state/i})).toBeInTheDocument();
    expect(screen.queryByLabelText('Last name')).not.toBeInTheDocument();
  });

  it('disables the placeholder so a set age or state cannot be cleared', async () => {
    renderPage('student');
    await screen.findByRole('heading', {level: 2, name: 'My Information'});

    expect(screen.getByRole('option', {name: 'Select age'})).toBeDisabled();
    expect(screen.getByRole('option', {name: 'Select a state'})).toBeDisabled();
  });

  it('keeps last name for a teacher and omits age/state', async () => {
    renderPage('teacher');
    await screen.findByRole('heading', {level: 2, name: 'My Information'});

    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', {name: /^age$/i}),
    ).not.toBeInTheDocument();
  });

  it('shows the For Parents and Guardians section for a student', async () => {
    renderPage('student');
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'For Parents and Guardians',
      }),
    ).toBeInTheDocument();
  });

  it('hides For Parents and Guardians for a teacher', async () => {
    renderPage('teacher');
    await screen.findByRole('heading', {level: 2, name: 'My Information'});
    expect(
      screen.queryByRole('heading', {name: 'For Parents and Guardians'}),
    ).toBeNull();
  });
});
