import {StatsigStableIdPattern} from '@code-dot-org/shared-constants';
import Cookies from 'js-cookie';

import DashboardApiClient from '../../api/dashboard/SingletonDashboardApiClient';
import {CodeStudioConfig} from '../../index';

// Name and attributes are a contract with other code.org pages and the Rails reader.
export const COOKIE_NAME = 'statsig_stable_id';

const STABLE_ID_FORMAT = new RegExp(`^${StatsigStableIdPattern}$`, 'i');

// Named without "statsig" so school content filters do not block it.
const SERVER_PATH = '/api/stable_id';
const SERVER_TIMEOUT_MS = 3000;

// Written by earlier Studio versions; removed so it cannot be reused.
const LEGACY_LOCAL_STORAGE_KEY = 'STATSIG_STABLE_ID';

/** Removal only takes when path and domain match the write. */
const COOKIE_SCOPE = {path: '/', domain: '.code.org'} as const;

/** No expiry, so the cookie lasts only the browser session. */
function cookieAttributes() {
  return {
    ...COOKIE_SCOPE,
    sameSite: 'Lax',
    // Local development serves over http, where a Secure cookie never lands.
    secure: CodeStudioConfig.environment !== 'development',
  } as const;
}

export function isValidStableId(value: unknown): value is string {
  return typeof value === 'string' && STABLE_ID_FORMAT.test(value);
}

/** Reading needs no consent; only writing does. */
export function readStableId(): string | undefined {
  const value = Cookies.get(COOKIE_NAME);
  return isValidStableId(value) ? value : undefined;
}

/** The Rails session's ID, so a first visit's frontend and backend events agree. */
export async function fetchStableId(): Promise<string | undefined> {
  try {
    const stableId = await DashboardApiClient.transport.request<string>({
      method: 'GET',
      url: SERVER_PATH,
      signal: AbortSignal.timeout(SERVER_TIMEOUT_MS),
    });
    return isValidStableId(stableId) ? stableId : undefined;
  } catch (error) {
    console.warn('[analytics] failed to fetch the stable ID:', error);
    return undefined;
  }
}

/** Call only when consent permits the cookie. */
export function persistStableId(stableId: string): void {
  Cookies.set(COOKIE_NAME, stableId, cookieAttributes());
}

export function forgetStableId(): void {
  Cookies.remove(COOKIE_NAME, COOKIE_SCOPE);
  try {
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);
  } catch {
    // Nothing to remove if the store is unreachable.
  }
}
