import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@code-dot-org/core/plugins/analytics', () => ({sendEvent: vi.fn()}));

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';
import {sendEvent} from '@code-dot-org/core/plugins/analytics';

import {
  USERS_LAB_KEY,
  registerUsersFixtures,
  resetUsersFixtures,
} from '../../fixtures';
import UsersSettingsPage from '../../UsersSettingsPage';

function renderIntegrationsTab(tag: string) {
  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag});
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <UsersSettingsPage tab="integrations" onTabChange={() => {}} />
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => resetUsersFixtures());

describe('LinkedAccounts analytics', () => {
  it('reports the unlink dialog opening with the row name', async () => {
    renderIntegrationsTab('lti-teacher');
    const disconnect = await screen.findByRole('button', {
      name: 'Disconnect Canvas',
    });
    vi.clearAllMocks();

    fireEvent.click(disconnect);

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('lti_unlink_modal_shown', {
      lms_name: 'Canvas',
    });
  });
});
