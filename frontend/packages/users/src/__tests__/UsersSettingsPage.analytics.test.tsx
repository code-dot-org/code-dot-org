import {render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@code-dot-org/core/plugins/analytics', () => ({sendEvent: vi.fn()}));

import {
  createQueryClient,
  QueryClientProvider,
  usersKeys,
} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';
import {sendEvent} from '@code-dot-org/core/plugins/analytics';

import {
  USERS_LAB_KEY,
  registerUsersFixtures,
  resetUsersFixtures,
} from '../fixtures';
import UsersSettingsPage from '../UsersSettingsPage';

const PAGE_VISITED_EVENT = 'Account Settings Page Visited';

/**
 * Renders with the current-user cache primed the way the Studio host primes it
 * at bootstrap, which is where the visit event reads its user type.
 */
function renderPage(tag: string, userType?: string) {
  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag});
  const client = createQueryClient({queries: {retry: false}});
  if (userType) {
    client.setQueryData(usersKeys.currentUser(), {isSignedIn: true, userType});
  }
  return render(
    <QueryClientProvider client={client}>
      <UsersSettingsPage tab="account-details" onTabChange={() => {}} />
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => resetUsersFixtures());

describe('UsersSettingsPage analytics', () => {
  it('reports the page visit at mount, before any fetch resolves', () => {
    renderPage('teacher', 'teacher');

    expect(sendEvent).toHaveBeenCalledWith(PAGE_VISITED_EVENT, {
      'user type': 'teacher',
    });
  });

  it('reports a student visit with the student user type', () => {
    renderPage('student', 'student');

    expect(sendEvent).toHaveBeenCalledWith(PAGE_VISITED_EVENT, {
      'user type': 'student',
    });
  });

  it('still reports the visit when the host primed no user', () => {
    renderPage('teacher');

    expect(sendEvent).toHaveBeenCalledWith(PAGE_VISITED_EVENT, {
      'user type': undefined,
    });
  });

  it('reports the visit exactly once per mount', async () => {
    renderPage('teacher', 'teacher');
    await screen.findByRole('tablist');

    expect(sendEvent).toHaveBeenCalledTimes(1);
  });
});
