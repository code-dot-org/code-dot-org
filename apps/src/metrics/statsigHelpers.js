import cookies from 'js-cookie';

import {StatsigStableIdKey} from '@cdo/generated-scripts/sharedConstants';

import {
  getEnvironment,
  isDevelopmentEnvironment,
  isProductionEnvironment,
  createUuid,
} from '../utils';

const STABLE_ID_KEY = StatsigStableIdKey;
const COOKIE_OPTIONS = {
  path: '/',
  domain: '.code.org',
  sameSite: 'Lax',
  secure: !isDevelopmentEnvironment(),
  expires: 365,
};

// Performance cookies (C0002). You can see what categories are enabled in OneTrust
// by inspecting the window.OnetrustActiveGroups global variable.
// Note that C0001 (Strictly Necessary) is always enabled and we do not need to check for it.
const ONETRUST_ALLOWED_CATEGORIES = ['C0002'];

export function getUserID() {
  const user_id_element = document.querySelector('script[data-user-id]');
  return user_id_element ? user_id_element.dataset.userId : null;
}

export function getUserType() {
  const user_type_element = document.querySelector('script[data-user-type');
  return user_type_element ? user_type_element.dataset.userType : null;
}

export function findOrCreateStableId() {
  if (consentAllowsStatsigCookie()) {
    const stableId = cookies.get(STABLE_ID_KEY) || createUuid();
    cookies.set(STABLE_ID_KEY, stableId, COOKIE_OPTIONS);
    return stableId;
  } else {
    // Ensure any existing cookie is removed to satisfy OneTrust
    // (must pass same attributes used when setting the cookie)
    cookies.remove(STABLE_ID_KEY, {path: '/', domain: '.code.org'});

    // Remove the legacy localStorage value written by earlier Studio versions.
    // See: https://github.com/code-dot-org/code-dot-org/pull/69708
    localStorage.removeItem(STABLE_ID_KEY.toUpperCase());

    // Return undefined to let Statsig set it's own stableID
    return undefined;
  }
}

function consentAllowsStatsigCookie() {
  if (isDevelopmentEnvironment()) return true;

  const groups = getOnetrustGroups();
  return ONETRUST_ALLOWED_CATEGORIES.some(id => groups.has(id));
}

function getOnetrustGroups() {
  try {
    const rawString =
      typeof window !== 'undefined' ? window.OnetrustActiveGroups || '' : '';
    return new Set(rawString.split(',').filter(Boolean));
  } catch (error) {
    return new Set();
  }
}

export function formatUserId(userId) {
  const userIdString = userId.toString() || 'none';
  if (!userId) {
    return userIdString;
  }
  if (isProductionEnvironment()) {
    return userIdString.padStart(5, '0');
  } else {
    const environment = getEnvironment();
    return `${environment}-${userIdString}`;
  }
}
