import {describe, expect, it} from 'vitest';

import {
  linkedAccountIcon,
  linkedAccountName,
  linkedAccountProvider,
  lmsPlatform,
} from '../linkedAccountProviders';

describe('linkedAccountProvider', () => {
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
  it('names Schoology as PowerSchool (Schoology)', () => {
    expect(lmsPlatform('schoology')?.name).toBe('PowerSchool (Schoology)');
  });

  it('returns nothing without an LMS', () => {
    expect(lmsPlatform(null)).toBeUndefined();
  });
});

describe('linkedAccountIcon', () => {
  it('shows an LMS login with its platform logo', () => {
    expect(linkedAccountIcon('lti_v1', 'schoology')).toEqual(
      lmsPlatform('schoology')?.icon,
    );
  });

  it('falls back to the generic mark for an unknown platform', () => {
    expect(linkedAccountIcon('lti_v1', 'moodle')).toEqual({
      iconName: 'graduation-cap',
    });
  });

  it('shows an OAuth login with its provider logo', () => {
    expect(linkedAccountIcon('microsoft_v2_auth', null)).toEqual(
      linkedAccountProvider('microsoft_v2_auth')?.icon,
    );
  });
});
