import {renderHook, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import type {PropsWithChildren} from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  createQueryClient,
  DashboardApiClient,
  QueryClientProvider,
  useCurrentUser,
} from '@code-dot-org/core/api';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import {fetchAuthOutcome} from '../fetchAuthOutcome';
import {primeCurrentUser} from '../primeCurrentUser';

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

let currentUserCalls = 0;

beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => {
  mockServer.resetHandlers();
  currentUserCalls = 0;
});
afterAll(() => mockServer.close());

beforeEach(() => {
  mockServer.use(
    http.get('*/api/v1/users/current', () => {
      currentUserCalls += 1;
      return HttpResponse.json(SIGNED_IN_RESPONSE);
    }),
  );
});

function wrapper(queryClient: ReturnType<typeof createQueryClient>) {
  return function Wrapper({children}: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('shared current-user cache', () => {
  it('issues exactly one current-user GET across the bootstrap and the page read', async () => {
    const queryClient = createQueryClient();

    // Root route beforeLoad: one fetch, then prime the cache.
    const auth = await fetchAuthOutcome();
    primeCurrentUser(queryClient, auth);
    expect(auth.status).toBe('signed-in');
    expect(currentUserCalls).toBe(1);

    // The accounts page reads the current user via the hook — from cache.
    const {result} = renderHook(() => useCurrentUser(DashboardApiClient), {
      wrapper: wrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(currentUserCalls).toBe(1);
    expect(result.current.data).toMatchObject({
      userType: 'student',
      displayName: 'Coder',
    });
  });

  it('control: without priming the hook fetches its own current user', async () => {
    const queryClient = createQueryClient();
    const {result} = renderHook(() => useCurrentUser(DashboardApiClient), {
      wrapper: wrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(currentUserCalls).toBe(1);
  });
});
