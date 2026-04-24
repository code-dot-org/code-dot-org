import type {KyInstance} from 'ky';
import {describe, it, expect, vi} from 'vitest';

import {getCurrent} from '../getCurrent';
import type {CurrentUserResponseSignedIn} from '../currentUserTypes';

const SIGNED_IN_RESPONSE: CurrentUserResponseSignedIn = {
  is_signed_in: true,
  id: 1,
  username: 'coder',
  display_name: 'Coder',
  short_name: 'Coder',
  user_type: 'student',
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

function makeHttp(jsonResult: unknown, rejectWith?: unknown): KyInstance {
  const json = rejectWith
    ? vi.fn().mockRejectedValue(rejectWith)
    : vi.fn().mockResolvedValue(jsonResult);
  return {get: vi.fn().mockReturnValue({json})} as unknown as KyInstance;
}

describe('getCurrent', () => {
  it('issues GET api/v1/users/current with no body', async () => {
    const http = makeHttp({is_signed_in: false});
    await getCurrent(http)();
    expect(http.get).toHaveBeenCalledWith('api/v1/users/current');
  });

  it('resolves with a signed-in response', async () => {
    const http = makeHttp(SIGNED_IN_RESPONSE);
    const result = await getCurrent(http)();
    expect(result).toEqual(SIGNED_IN_RESPONSE);
    if (result.is_signed_in) {
      expect(result.display_name).toBe('Coder');
    }
  });

  it('resolves with a signed-out response', async () => {
    const http = makeHttp({is_signed_in: false});
    const result = await getCurrent(http)();
    expect(result).toEqual({is_signed_in: false});
  });

  it('rejects on HTTP 5xx', async () => {
    const error = Object.assign(new Error('HTTPError'), {
      response: {status: 503},
    });
    const http = makeHttp(null, error);
    await expect(getCurrent(http)()).rejects.toMatchObject({
      response: {status: 503},
    });
  });

  it('rejects on network error', async () => {
    const error = new TypeError('Failed to fetch');
    const http = makeHttp(null, error);
    await expect(getCurrent(http)()).rejects.toThrow('Failed to fetch');
  });

  it('rejects on malformed JSON', async () => {
    const error = new SyntaxError('Unexpected token');
    const http = makeHttp(null, error);
    await expect(getCurrent(http)()).rejects.toThrow(SyntaxError);
  });
});
