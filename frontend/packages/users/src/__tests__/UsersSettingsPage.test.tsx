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

import {
  USERS_LAB_KEY,
  registerUsersFixtures,
  resetUsersFixtures,
} from '../fixtures';
import UsersSettingsPage from '../UsersSettingsPage';

function renderPage(tag: string) {
  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag});
  const client = createQueryClient({queries: {retry: false}});
  return render(
    <QueryClientProvider client={client}>
      <UsersSettingsPage tab="account-details" onTabChange={() => {}} />
    </QueryClientProvider>,
  );
}

afterEach(() => resetUsersFixtures());

describe('UsersSettingsPage', () => {
  it('shows a loading state, then the page heading and tabs (teacher)', async () => {
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
    registerUsersFixtures();
    setActiveScenario({labKey: USERS_LAB_KEY, tag: 'teacher'});
    mockServer.use(
      http.get(
        '*/api/v1/users/me/settings',
        () => new HttpResponse(null, {status: 500}),
      ),
    );
    const client = createQueryClient({queries: {retry: false}});
    render(
      <QueryClientProvider client={client}>
        <UsersSettingsPage tab="account-details" onTabChange={() => {}} />
      </QueryClientProvider>,
    );

    const alert = await screen.findByRole('alert');
    expect(
      within(alert).getByRole('button', {name: 'Try again'}),
    ).toBeInTheDocument();
  });

  it('moves focus to the heading after recovering from a load error', async () => {
    registerUsersFixtures();
    setActiveScenario({labKey: USERS_LAB_KEY, tag: 'teacher'});
    // Fail once; the retry falls through to the scenario's success handler.
    mockServer.use(
      http.get(
        '*/api/v1/users/me/settings',
        () => new HttpResponse(null, {status: 500}),
        {once: true},
      ),
    );
    const client = createQueryClient({queries: {retry: false}});
    render(
      <QueryClientProvider client={client}>
        <UsersSettingsPage tab="account-details" onTabChange={() => {}} />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole('button', {name: 'Try again'}));

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'My Account',
    });
    await waitFor(() => expect(heading).toHaveFocus());
  });
});
