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

const COOKIE_PATH = '/';
const COOKIE_DOMAIN = '.code.org';
const COOKIE_SCOPE = `path=${COOKIE_PATH}; domain=${COOKIE_DOMAIN}`;

function readLocalStorage(): string | null {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readCookie(): string | undefined {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
  );
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}

/** Reads the persisted stable ID, preferring the cookie. Always permitted. */
export function readStableId(): string | undefined {
  return readCookie() || readLocalStorage() || undefined;
}

/** Writes the stable ID to both stores. Call only when consent permits it. */
export function persistStableId(stableId: string): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(stableId)}; ${COOKIE_SCOPE}; SameSite=Lax; Secure`;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, stableId);
  } catch {
    // The cookie alone still identifies the session.
  }
}

/** Deletes every persisted copy of the stable ID. */
export function forgetStableId(): void {
  document.cookie = `${COOKIE_NAME}=; ${COOKIE_SCOPE}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Nothing to remove if the store is unreachable.
  }
}
