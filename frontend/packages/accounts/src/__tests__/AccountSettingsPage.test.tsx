import {render, screen, within} from '@testing-library/react';
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

    // The tablist only renders once both queries resolve.
    const tablist = await screen.findByRole('tablist', {
      name: 'Account settings sections',
    });
    expect(
      screen.getByRole('heading', {level: 1, name: 'My Account'}),
    ).toBeInTheDocument();
    expect(document.title).toBe('My Account — Code.org');

    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-disabled', 'true');

    for (const name of [
      'My Information',
      'Login Information',
      'Language',
      'Account Actions',
    ]) {
      expect(screen.getByRole('heading', {level: 2, name})).toBeInTheDocument();
    }
  });

  it('renders the student variant without a last name', async () => {
    renderPage('student');
    // Wait for the loaded state (the section heading) before asserting fields.
    await screen.findByRole('heading', {level: 2, name: 'My Information'});
    expect(screen.queryByText('Last name')).not.toBeInTheDocument();
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
