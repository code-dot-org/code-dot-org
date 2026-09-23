import {describe, expect, it} from 'vitest';

import type {
  AuthenticationOptionSummary,
  IntegrationsSettings,
  UserSettings,
} from '@code-dot-org/core/api';

import {
  connectedAccounts,
  isConnectLocked,
  lockedConnectMessage,
  unconnectedProviders,
} from '../linkedAccounts';

const INTEGRATIONS: IntegrationsSettings = {
  canManageLinkedAccounts: true,
  isGoogleClassroomStudent: false,
  isCleverStudent: false,
  personalAccountLinkingEnabled: true,
  lmsName: null,
};

const email = {id: 1, credentialType: 'email', email: 'ada@example.com'};
const google = {id: 2, credentialType: 'google_oauth2', email: null};
const clever = {id: 3, credentialType: 'clever', email: null};
const lti = {id: 4, credentialType: 'lti_v1', email: 'ada@lms.example.com'};
const microsoft = {id: 5, credentialType: 'microsoft_v2_auth', email: null};

function settingsWith(
  authenticationOptions: AuthenticationOptionSummary[],
  overrides: Partial<UserSettings> = {},
) {
  return {
    authenticationOptions,
    hasPassword: false,
    age: 14,
    usState: 'WA',
    ...overrides,
  } as UserSettings;
}

describe('connectedAccounts', () => {
  it('orders linked logins by provider, LMS last, and drops email logins', () => {
    const options = [lti, email, microsoft, clever, google];

    expect(connectedAccounts(options)).toEqual([
      google,
      microsoft,
      clever,
      lti,
    ]);
  });

  it('keeps every option of a provider linked twice', () => {
    const second = {id: 6, credentialType: 'google_oauth2', email: null};

    expect(connectedAccounts([google, second])).toEqual([google, second]);
  });
});

describe('unconnectedProviders', () => {
  it('lists the linkable providers with no linked login, in legacy order', () => {
    expect(unconnectedProviders([email, clever])).toEqual([
      'google_oauth2',
      'microsoft_v2_auth',
      'classlink',
      'facebook',
    ]);
  });
});

describe('isConnectLocked', () => {
  const locked = {...INTEGRATIONS, personalAccountLinkingEnabled: false};

  it.each(['google_oauth2', 'microsoft_v2_auth', 'facebook'])(
    'locks %s while personal account linking is off',
    provider => {
      expect(isConnectLocked(provider, locked)).toBe(true);
    },
  );

  it.each(['clever', 'classlink'])(
    'never locks %s, a school login',
    provider => {
      expect(isConnectLocked(provider, locked)).toBe(false);
    },
  );

  it('locks nothing while personal account linking is on', () => {
    expect(isConnectLocked('google_oauth2', INTEGRATIONS)).toBe(false);
  });
});

describe('lockedConnectMessage', () => {
  it('asks for parental permission once age and state are known', () => {
    expect(lockedConnectMessage(settingsWith([]))).toBe(
      'Uh oh! You must obtain parental permission before creating a linked account.',
    );
  });

  it('asks for age and state while either is missing', () => {
    expect(lockedConnectMessage(settingsWith([], {usState: null}))).toBe(
      'Uh oh! Please provide your age and state before adding a linked account.',
    );
  });
});
