import {fireEvent, render, screen, waitFor} from '@testing-library/react';
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

const rosterSync = () =>
  screen.findByRole('checkbox', {name: 'Sync LMS rosters'});
const save = () => screen.findByRole('button', {name: 'Save changes'});

beforeEach(() => vi.clearAllMocks());
afterEach(() => resetUsersFixtures());

describe('IntegrationsForm analytics', () => {
  it('reports the toggle off when roster sync is saved disabled', async () => {
    renderIntegrationsTab('lti-teacher');
    fireEvent.click(await rosterSync());
    vi.clearAllMocks();

    fireEvent.click(await save());

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('lti_opt_out_toggle_off', {
      lms_name: 'canvas_cloud',
    });
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Changes saved.'),
    );
  });

  it('reports the toggle on when roster sync is saved enabled', async () => {
    renderIntegrationsTab('lti-only-teacher');
    fireEvent.click(await rosterSync());
    vi.clearAllMocks();

    fireEvent.click(await save());

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('lti_opt_out_toggle_on', {
      lms_name: 'schoology',
    });
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Changes saved.'),
    );
  });

  it('reports nothing when the save has no change', async () => {
    renderIntegrationsTab('lti-teacher');
    fireEvent.click(await rosterSync());
    fireEvent.click(await rosterSync());
    vi.clearAllMocks();

    fireEvent.click(await save());

    expect(sendEvent).not.toHaveBeenCalled();
  });
});
