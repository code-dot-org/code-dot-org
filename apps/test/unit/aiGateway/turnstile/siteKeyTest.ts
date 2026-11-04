import {TURNSTILE_SITE_KEY} from '@cdo/apps/aiGateway/turnstile/constants';
import {
  getTurnstileSiteKey,
  TURNSTILE_TEST_SITE_KEYS,
} from '@cdo/apps/aiGateway/turnstile/siteKey';
import {
  resetWindowLocation,
  setWindowLocation,
} from '@cdo/apps/code-studio/utils';
import * as utils from '@cdo/apps/utils';

describe('getTurnstileSiteKey', () => {
  const withSearch = (search: string) =>
    setWindowLocation({...window.location, search});

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    resetWindowLocation();
    jest.restoreAllMocks();
  });

  it('returns the production key without an override', () => {
    withSearch('');
    expect(getTurnstileSiteKey()).toBe(TURNSTILE_SITE_KEY);
  });

  it.each(['pass', 'fail'] as const)(
    'returns the %s test key when asked for it',
    name => {
      withSearch(`?turnstileSiteKey=${name}`);
      expect(getTurnstileSiteKey()).toBe(TURNSTILE_TEST_SITE_KEYS[name]);
    }
  );

  it('ignores an unrecognized override', () => {
    withSearch('?turnstileSiteKey=0x4AAAAAAAsomethingelse');
    expect(getTurnstileSiteKey()).toBe(TURNSTILE_SITE_KEY);
    expect(console.warn).toHaveBeenCalled();
  });

  it.each(['adhoc', 'staging', 'test'])('honors the override on %s', env => {
    jest.spyOn(utils, 'getEnvironment').mockReturnValue(env);
    withSearch('?turnstileSiteKey=pass');
    expect(getTurnstileSiteKey()).toBe(TURNSTILE_TEST_SITE_KEYS.pass);
  });

  it.each(['production', 'levelbuilder', 'unknown'])(
    'ignores the override on %s',
    env => {
      jest.spyOn(utils, 'getEnvironment').mockReturnValue(env);
      withSearch('?turnstileSiteKey=pass');
      expect(getTurnstileSiteKey()).toBe(TURNSTILE_SITE_KEY);
    }
  );
});
