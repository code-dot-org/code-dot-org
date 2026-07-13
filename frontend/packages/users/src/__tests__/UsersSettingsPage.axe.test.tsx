import {render, screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {afterEach, describe, expect, it} from 'vitest';
import {axe} from 'vitest-axe';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import {
  USERS_LAB_KEY,
  registerUsersFixtures,
  resetUsersFixtures,
} from '../fixtures';
import UsersSettingsPage from '../UsersSettingsPage';

// Audit the whole document: MUI Dialogs portal to document.body, outside the
// render container.
function renderPage(tag: string) {
  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag});
  const client = createQueryClient({queries: {retry: false}});
  render(
    <QueryClientProvider client={client}>
      <UsersSettingsPage tab="account-details" onTabChange={() => {}} />
    </QueryClientProvider>,
  );
}

// jsdom can't compute color-contrast (no layout/paint), so disable it here;
// the Playwright a11y spec verifies contrast in a real browser.
function auditBody() {
  return axe(document.body, {rules: {'color-contrast': {enabled: false}}});
}

afterEach(() => resetUsersFixtures());

describe('UsersSettingsPage — accessibility', () => {
  it.each(['teacher', 'student', 'sso-teacher', 'sso-student', 'minimal'])(
    'has no axe violations on the loaded page (%s)',
    async tag => {
      renderPage(tag);
      await screen.findByRole('tablist');
      expect(await auditBody()).toHaveNoViolations();
    },
  );

  it('has no axe violations in the error state', async () => {
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
    await screen.findByRole('alert');
    expect(await auditBody()).toHaveNoViolations();
  });
});
