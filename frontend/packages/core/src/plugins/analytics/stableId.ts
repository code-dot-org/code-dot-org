import Cookies from 'js-cookie';

/**
 * Storage for the Statsig stable ID.
 *
 * The cookie name, value, and attributes are a contract shared with other
 * code.org pages and with the Rails server-side session reader, which is why
 * the cookie is session-scoped and domain-wide. Changing any of them splits
 * one visitor into several.
 */

export const COOKIE_NAME = 'statsig_stable_id';
export const LOCAL_STORAGE_KEY = 'STATSIG_STABLE_ID';

/** No expiry, so the cookie lasts only the browser session. */
const COOKIE_ATTRIBUTES = {
  path: '/',
  domain: '.code.org',
  sameSite: 'Lax',
  secure: true,
} as const;

/** Removal only takes when path and domain match the write. */
const COOKIE_SCOPE = {
  path: COOKIE_ATTRIBUTES.path,
  domain: COOKIE_ATTRIBUTES.domain,
};

function readLocalStorage(): string | null {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Reads the persisted stable ID, preferring the cookie. Always permitted. */
export function readStableId(): string | undefined {
  return Cookies.get(COOKIE_NAME) || readLocalStorage() || undefined;
}

/** Writes the stable ID to both stores. Call only when consent permits it. */
export function persistStableId(stableId: string): void {
  Cookies.set(COOKIE_NAME, stableId, COOKIE_ATTRIBUTES);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, stableId);
  } catch {
    // The cookie alone still identifies the session.
  }
}

/** Deletes every persisted copy of the stable ID. */
export function forgetStableId(): void {
  Cookies.remove(COOKIE_NAME, COOKIE_SCOPE);
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Nothing to remove if the store is unreachable.
  }
}
