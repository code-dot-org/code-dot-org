import {describe, expect, it} from 'vitest';

import {providerName} from '../providerName';

describe('providerName', () => {
  it.each([
    ['google_oauth2', 'Google'],
    ['clever', 'Clever'],
    ['microsoft_v2_auth', 'Microsoft'],
    ['facebook', 'Facebook'],
    ['classlink', 'ClassLink'],
    ['twitter', 'Twitter'],
  ])('maps %s to %s', (credentialType, name) => {
    expect(providerName(credentialType)).toBe(name);
  });

  it('falls back to the raw credential type for an unrecognized provider', () => {
    expect(providerName('powerschool')).toBe('powerschool');
  });
});
