import Cookies from 'js-cookie';

declare global {
  interface Window {
    /** Rendered by the Rails page; absent on shells that omit the user header. */
    cookieEnvSuffix?: string;
  }
}

const STORAGE_KEY = 'experimentsList';
const COOKIE_PREFIX = '_experiments';

interface StoredExperiment {
  key?: string;
  expiration?: number;
}

/**
 * Experiments enabled in this browser, dropping any whose expiry has passed.
 * Storage may hold the same key more than once; the first live entry wins.
 */
function localStorageExperiments(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as StoredExperiment[];
    const now = Date.now();
    const live = stored.filter(
      experiment =>
        experiment.key &&
        (experiment.expiration === undefined || experiment.expiration > now),
    );
    return [...new Set(live.map(experiment => experiment.key as string))];
  } catch {
    return [];
  }
}

/**
 * Experiments mirrored into the `_experiments` cookie at sign-in. The cookie
 * name is suffixed per environment by `window.cookieEnvSuffix`; a page that
 * does not render that global reads the unsuffixed name, so a non-production
 * deployment finds no cookie rather than the wrong one.
 */
function cookieExperiments(): string[] {
  const suffix = window.cookieEnvSuffix ?? '';
  const raw = Cookies.get(`${COOKIE_PREFIX}${suffix}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/** Every experiment enabled for this browser, cookie-mirrored ones first. */
export function getEnabledExperiments(): string[] {
  return [...cookieExperiments(), ...localStorageExperiments()];
}
