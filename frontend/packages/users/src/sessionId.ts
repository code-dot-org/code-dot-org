/**
 * This module contains routines that can identify the user session.
 */

/**
 * Returns a value from sessionStorage if it exists. If it does not exist
 * or session storage is not available, the value given in defaultValue
 * is returned instead.
 *
 * @param key - The key to retrieve from session storage.
 * @param defaultValue - Returned if no such value is in session storage.
 * @returns The value from session storage or the given default.
 */
const tryGetSessionStorage: <T = string | number | boolean>(
  key: string,
  defaultValue: T,
) => string | T = <T = string | number | boolean>(
  key: string,
  defaultValue: T,
) => {
  let returnValue: string | T | null = defaultValue;
  try {
    returnValue = sessionStorage.getItem(key);
  } catch (_) {
    // Ignore, return default
  }
  return returnValue !== null ? returnValue : defaultValue;
};

/**
 * Simple wrapper around sessionStorage.setItem that catches the quota exceeded
 * exceptions we get when we call setItem in Safari's private mode.
 *
 * @param key - The key to use to store the given value.
 * @param value - The value to store.
 * @return True if we set successfully
 */
const trySetSessionStorage: (key: string, value: string) => boolean = (
  key,
  value,
) => {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof Error) {
      if (e.name !== 'QuotaExceededError') {
        throw e;
      }
    }
    return false;
  }
};

/**
 * Return a random id which will be consistent for this browser tab or window as long as it remains
 * open, including if this page is reloaded or if we navigate away and then back to it. The id will
 * be different for other tabs, including tabs in other browsers or on other machines. Unfortunately,
 * duplicating a browser tab will result in two tabs with the same id, but this is not common.
 *
 * @returns A string representing a float between 0 and 1 or `false` if it failed to save it.
 */
export const getTabId: () => string | boolean = () => {
  const tabId = tryGetSessionStorage('tabId', false);
  if (tabId) {
    return tabId;
  }
  trySetSessionStorage('tabId', Math.random().toString());
  return tryGetSessionStorage('tabId', false);
};
