import {describe, expect, it} from 'vitest';

import {
  connectedAccounts,
  unconnectedLmsPlatforms,
  unconnectedProviders,
} from '../linkedAccounts';

const email = {id: 1, credentialType: 'email', email: 'ada@example.com'};
const google = {id: 2, credentialType: 'google_oauth2', email: null};
const clever = {id: 3, credentialType: 'clever', email: null};
const lti = {id: 4, credentialType: 'lti_v1', email: 'ada@lms.example.com'};
const microsoft = {id: 5, credentialType: 'microsoft_v2_auth', email: null};

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

describe('unconnectedLmsPlatforms', () => {
  it('offers Canvas and Schoology when no LMS login is linked', () => {
    expect(unconnectedLmsPlatforms([email, google], null)).toEqual([
      'canvas_cloud',
      'schoology',
    ]);
  });

  it('drops the linked LMS, counting Canvas Beta as Canvas', () => {
    expect(unconnectedLmsPlatforms([lti], 'canvas_beta_cloud')).toEqual([
      'schoology',
    ]);
  });

  it('ignores the platform name without a linked LMS login', () => {
    expect(unconnectedLmsPlatforms([email], 'schoology')).toEqual([
      'canvas_cloud',
      'schoology',
    ]);
  });
});
