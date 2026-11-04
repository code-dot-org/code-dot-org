import {queryParams} from '@cdo/apps/code-studio/utils';
import {getEnvironment} from '@cdo/apps/utils';

import {LOG, TURNSTILE_SITE_KEY} from './constants';

// Cloudflare's published test keys, in their invisible variants to match the
// production widget. They work on any hostname, including localhost, but their
// tokens only verify against the matching test secret, so the gateway worker
// will not accept them.
export const TURNSTILE_TEST_SITE_KEYS = {
  pass: '1x00000000000000000000BB',
  fail: '2x00000000000000000000BB',
} as const;

type TurnstileTestSiteKey = keyof typeof TURNSTILE_TEST_SITE_KEYS;

// Allowlisted rather than excluding production: an unrecognized hostname
// could be serving production.
const OVERRIDE_ENVIRONMENTS = ['development', 'adhoc', 'staging', 'test'];

const isTestSiteKey = (value: unknown): value is TurnstileTestSiteKey =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(TURNSTILE_TEST_SITE_KEYS, value);

/**
 * The site key to render with. Development, adhoc, staging and test hosts
 * honor `?turnstileSiteKey=pass|fail`; every other host ignores it.
 */
export function getTurnstileSiteKey(): string {
  if (!OVERRIDE_ENVIRONMENTS.includes(getEnvironment())) {
    return TURNSTILE_SITE_KEY;
  }
  const override = queryParams('turnstileSiteKey');
  if (override === undefined) {
    return TURNSTILE_SITE_KEY;
  }
  if (!isTestSiteKey(override)) {
    console.warn(
      `${LOG} Ignoring turnstileSiteKey=${override}; expected one of ${Object.keys(
        TURNSTILE_TEST_SITE_KEYS
      ).join(', ')}`
    );
    return TURNSTILE_SITE_KEY;
  }
  console.log(`${LOG} Using Cloudflare test site key "${override}"`);
  return TURNSTILE_TEST_SITE_KEYS[override];
}
