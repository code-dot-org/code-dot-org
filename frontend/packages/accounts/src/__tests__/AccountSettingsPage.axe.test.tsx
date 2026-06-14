import {fireEvent, render, screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {afterEach, describe, expect, it} from 'vitest';
import {axe} from 'vitest-axe';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import AccountSettingsPage from '../AccountSettingsPage';
import {
  ACCOUNTS_LAB_KEY,
  registerAccountsFixtures,
  resetAccountsFixtures,
} from '../fixtures';

// Audit the whole document: MUI Dialogs portal to document.body, outside the
// render container.
function renderPage(tag: string) {
  registerAccountsFixtures();
  setActiveScenario({labKey: ACCOUNTS_LAB_KEY, tag});
  const client = createQueryClient({queries: {retry: false}});
  render(
    <QueryClientProvider client={client}>
      <AccountSettingsPage tab="account-details" onTabChange={() => {}} />
    </QueryClientProvider>,
  );
}

// jsdom can't compute color-contrast (no layout/paint), so disable it here;
// the Playwright a11y spec verifies contrast in a real browser.
function auditBody() {
  return axe(document.body, {rules: {'color-contrast': {enabled: false}}});
}

afterEach(() => resetAccountsFixtures());

describe('AccountSettingsPage — accessibility', () => {
  it.each(['teacher', 'student', 'sso-teacher', 'sso-student', 'minimal'])(
    'has no axe violations on the loaded page (%s)',
    async tag => {
      renderPage(tag);
      await screen.findByRole('tablist');
      expect(await auditBody()).toHaveNoViolations();
    },
  );

  it('has no axe violations with the dirty save bar shown', async () => {
    renderPage('teacher');
    const displayName = await screen.findByLabelText(/Display name/);
    fireEvent.change(displayName, {target: {value: 'Dr. Ada'}});
    await screen.findByRole('button', {name: 'Save changes'});
    expect(await auditBody()).toHaveNoViolations();
  });

  it('has no axe violations in the error state', async () => {
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
    await screen.findByRole('alert');
    expect(await auditBody()).toHaveNoViolations();
  });

  it('has no axe violations with the update-email modal open', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');
    fireEvent.click(screen.getByRole('button', {name: 'Update email'}));
    await screen.findByRole('dialog', {name: /update email/i});
    expect(await auditBody()).toHaveNoViolations();
  });

  it('has no axe violations with the update-password modal open', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');
    fireEvent.click(screen.getByRole('button', {name: 'Update password'}));
    await screen.findByRole('dialog', {name: /update password/i});
    expect(await auditBody()).toHaveNoViolations();
  });

  it('has no axe violations with the create-password modal open (sso)', async () => {
    renderPage('sso-teacher');
    await screen.findByRole('tablist');
    fireEvent.click(screen.getByRole('button', {name: /create password/i}));
    await screen.findByRole('dialog', {name: /create password/i});
    expect(await auditBody()).toHaveNoViolations();
  });

  it('has no axe violations with the account-type alertdialog open', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');
    fireEvent.change(screen.getByRole('combobox', {name: /account type/i}), {
      target: {value: 'student'},
    });
    await screen.findByRole('alertdialog', {name: /change account type/i});
    expect(await auditBody()).toHaveNoViolations();
  });

  it('has no axe violations with the delete-account alertdialog open', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');
    fireEvent.click(screen.getByRole('button', {name: /delete my account/i}));
    await screen.findByRole('alertdialog', {name: /delete/i});
    expect(await auditBody()).toHaveNoViolations();
  });

  it('has no axe violations with the sign-out-sessions alertdialog open', async () => {
    renderPage('teacher');
    await screen.findByRole('tablist');
    fireEvent.click(
      screen.getByRole('button', {name: /sign out all other sessions/i}),
    );
    await screen.findByRole('alertdialog', {
      name: /sign out all other sessions/i,
    });
    expect(await auditBody()).toHaveNoViolations();
  });
});
