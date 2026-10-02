/**
 * Simple wrapper around localStorage.getItem that catches any exceptions (for
 * example when we call getItem in Safari's private mode)
 * @return Returns the value of the key in localStorage, `null` if not set or the defaultValue if there is an error
 */
export const tryGetLocalStorage: (
  key: string,
  defaultValue: string | null,
) => string | null = (key, defaultValue) => {
  let returnValue = defaultValue;
  try {
    returnValue = localStorage.getItem(key);
  } catch (_) {
    // Ignore errors and we will return false
  }
  return returnValue;
};

/**
 * Simple wrapper around localStorage.setItem that catches any exceptions (for
 * example when we call setItem in Safari's private mode)
 * @return 'true' if we set successfully
 */
export const trySetLocalStorage: (item: string, value: string) => boolean = (
  item,
  value,
) => {
  try {
    localStorage.setItem(item, value);
    return true;
  } catch (_) {
    // Ignore errors and we will return false
  }
  return false;
};
