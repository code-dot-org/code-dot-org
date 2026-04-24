import {render, screen, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {ZodError} from 'zod';

import {DashboardApiClient} from '@code-dot-org/core/api';

import {AuthProvider} from '../AuthProvider';
import {useAuth} from '../useAuth';

vi.mock('@code-dot-org/core/api', () => ({
  DashboardApiClient: {
    users: {getCurrent: vi.fn()},
  },
}));

vi.mock('@code-dot-org/core/plugins/observability', () => ({
  recordError: vi.fn(),
  logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn()},
}));

const getCurrent = DashboardApiClient.users.getCurrent as ReturnType<
  typeof vi.fn
>;

const SIGNED_IN_RESPONSE = {
  is_signed_in: true as const,
  id: 1,
  username: 'coder',
  display_name: 'Coder',
  short_name: 'Coder',
  user_type: 'student' as const,
  is_verified_instructor: false,
  is_levelbuilder: false,
  educator_role: null,
  grades_teaching: [],
  under_13: false,
  over_21: false,
  age: null,
  country_code: null,
  us_state_code: null,
  child_account_compliance_state: null,
  sharing_disabled: false,
  mute_music: false,
  sort_by_family_name: false,
  has_seen_homepage_welcome: false,
  has_dismissed_personalization_alert: false,
  ai_chat_access_level: 'enabled',
  ai_tutor_access_denied: false,
  ai_rubrics_disabled: null,
  ai_differentiation_enabled: false,
  has_seen_ai_assessments_announcement: false,
  has_completed_ai_differentiation_welcome: false,
  is_lti: false,
  in_section: null,
  created_at: '2024-01-01T00:00:00Z',
};

function AuthStatus() {
  const auth = useAuth();
  return <div data-testid="status">{auth.status}</div>;
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <AuthStatus />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    getCurrent.mockReset();
  });

  it('starts in loading state', () => {
    getCurrent.mockReturnValue(new Promise(() => {}));
    renderWithProvider();
    expect(screen.getByTestId('status').textContent).toBe('loading');
  });

  it('transitions to signed-in on success', async () => {
    getCurrent.mockResolvedValue(SIGNED_IN_RESPONSE);
    renderWithProvider();
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('signedIn');
  });

  it('transitions to signed-out when not signed in', async () => {
    getCurrent.mockResolvedValue({is_signed_in: false});
    renderWithProvider();
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('signedOut');
  });

  it('transitions to error on HTTP failure', async () => {
    getCurrent.mockRejectedValue(
      Object.assign(new Error(), {response: new Response(null, {status: 503})}),
    );
    renderWithProvider();
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('error');
  });

  it('transitions to error on network failure', async () => {
    getCurrent.mockRejectedValue(new TypeError('Failed to fetch'));
    renderWithProvider();
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('error');
  });

  it('transitions to error on malformed body', async () => {
    getCurrent.mockRejectedValue(new ZodError([]));
    renderWithProvider();
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('error');
  });

  it('retries: error → loading → signed-in', async () => {
    getCurrent.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    getCurrent.mockResolvedValueOnce(SIGNED_IN_RESPONSE);

    function RetryButton() {
      const auth = useAuth();
      return (
        <>
          <div data-testid="status">{auth.status}</div>
          {auth.status === 'error' && (
            <button onClick={auth.onRetry}>retry</button>
          )}
        </>
      );
    }

    render(
      <AuthProvider>
        <RetryButton />
      </AuthProvider>,
    );

    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('error');

    await act(async () => {
      screen.getByRole('button', {name: 'retry'}).click();
    });
    await act(async () => {});
    expect(screen.getByTestId('status').textContent).toBe('signedIn');
  });

  it('fetches only once across re-renders', async () => {
    getCurrent.mockResolvedValue(SIGNED_IN_RESPONSE);
    const {rerender} = renderWithProvider();
    await act(async () => {});
    rerender(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );
    await act(async () => {});
    expect(getCurrent).toHaveBeenCalledTimes(1);
  });
});
