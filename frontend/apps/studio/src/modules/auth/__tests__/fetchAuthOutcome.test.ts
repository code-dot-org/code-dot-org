import {describe, it, expect, vi, beforeEach} from 'vitest';
import {ZodError} from 'zod';

import {DashboardApiClient} from '@code-dot-org/core/api';
import {logger} from '@code-dot-org/core/plugins/observability';

import {fetchAuthOutcome} from '../fetchAuthOutcome';

vi.mock('@code-dot-org/core/api', () => ({
  DashboardApiClient: {
    users: {getCurrent: vi.fn()},
  },
}));

vi.mock('@code-dot-org/core/plugins/observability', () => ({
  recordError: vi.fn().mockReturnValue('evt-123'),
  logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn()},
}));

const getCurrent = DashboardApiClient.users.getCurrent as ReturnType<
  typeof vi.fn
>;
const loggerError = logger.error as ReturnType<typeof vi.fn>;

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

describe('fetchAuthOutcome', () => {
  beforeEach(() => {
    getCurrent.mockReset();
    loggerError.mockReset();
  });

  it('returns signedIn when the session is active', async () => {
    getCurrent.mockResolvedValue(SIGNED_IN_RESPONSE);
    const result = await fetchAuthOutcome();
    expect(result.status).toBe('signedIn');
    if (result.status === 'signedIn') {
      expect(result.display_name).toBe('Coder');
    }
  });

  it('returns signedOut when no session is active', async () => {
    getCurrent.mockResolvedValue({is_signed_in: false});
    const result = await fetchAuthOutcome();
    expect(result).toEqual({status: 'signedOut'});
  });

  it('returns error on HTTP failure', async () => {
    getCurrent.mockRejectedValue(
      Object.assign(new Error(), {response: new Response(null, {status: 503})}),
    );
    const result = await fetchAuthOutcome();
    expect(result.status).toBe('error');
  });

  it('returns error on network failure', async () => {
    getCurrent.mockRejectedValue(new TypeError('Failed to fetch'));
    const result = await fetchAuthOutcome();
    expect(result.status).toBe('error');
  });

  it('returns error on schema mismatch (ZodError → parse_error)', async () => {
    getCurrent.mockRejectedValue(new ZodError([]));
    const result = await fetchAuthOutcome();
    expect(result.status).toBe('error');
  });

  it('returns error on malformed JSON (SyntaxError → parse_error)', async () => {
    getCurrent.mockRejectedValue(new SyntaxError('Unexpected token'));
    const result = await fetchAuthOutcome();
    expect(result.status).toBe('error');
  });

  it('surfaces the observability event ID on error', async () => {
    getCurrent.mockRejectedValue(new TypeError('Failed to fetch'));
    const result = await fetchAuthOutcome();
    if (result.status === 'error') {
      expect(result.observabilityEventId).toBe('evt-123');
    }
  });

  it('logs a terminal failure message on every error', async () => {
    getCurrent.mockRejectedValue(new TypeError('Failed to fetch'));
    await fetchAuthOutcome();
    expect(loggerError).toHaveBeenCalledWith(
      'auth bootstrap: terminal failure',
      expect.objectContaining({error_kind: 'network_error'}),
    );
  });
});
