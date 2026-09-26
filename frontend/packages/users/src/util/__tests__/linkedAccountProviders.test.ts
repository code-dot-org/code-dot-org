import {describe, expect, it} from 'vitest';

import {
  linkedAccountName,
  linkedAccountProvider,
  lmsPlatform,
} from '../linkedAccountProviders';

describe('linkedAccountProvider', () => {
  it('labels Google as both a sign-in and an LMS integration', () => {
    expect(linkedAccountProvider('google_oauth2')?.badges).toEqual([
      'SSO',
      'LMS Integration',
    ]);
  });

  it('returns nothing for a provider the page does not list', () => {
    expect(linkedAccountProvider('twitter')).toBeUndefined();
  });
});

describe('linkedAccountName', () => {
  it('names an OAuth login by its provider', () => {
    expect(linkedAccountName('microsoft_v2_auth', null)).toBe('Microsoft');
  });

  it('names an LMS login by its platform', () => {
    expect(linkedAccountName('lti_v1', 'canvas_beta_cloud')).toBe(
      'Canvas Beta',
    );
  });

  it('falls back to LMS for an unknown platform', () => {
    expect(linkedAccountName('lti_v1', 'moodle')).toBe('LMS');
  });
});

describe('lmsPlatform', () => {
  it('names Schoology', () => {
    expect(lmsPlatform('schoology')?.name).toBe('Schoology');
  });

  it('returns nothing without an LMS', () => {
    expect(lmsPlatform(null)).toBeUndefined();
  });
});
