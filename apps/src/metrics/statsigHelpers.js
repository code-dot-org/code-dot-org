import cookies from 'js-cookie';

import {StatsigStableIdKey} from '@cdo/generated-scripts/sharedConstants';
import {api_statsig_stable_id_url} from '@cdo/generated-scripts/studioRoutes';

import {
  getEnvironment,
  isDevelopmentEnvironment,
  isProductionEnvironment,
  createUuid,
} from '../utils';

const STABLE_ID_KEY = StatsigStableIdKey;
const STABLE_ID_TIMEOUT_MS = 3000;
const COOKIE_OPTIONS = {
  path: '/',
  domain: '.code.org',
  sameSite: 'Lax',
  secure: !isDevelopmentEnvironment(),
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

export async function findOrCreateStableId() {
  if (consentAllowsStatsigCookie()) {
    let stableId = cookies.get(STABLE_ID_KEY);

    if (!stableId) {
      try {
        const response = await fetch(api_statsig_stable_id_url(), {
          signal: AbortSignal.timeout(STABLE_ID_TIMEOUT_MS),
        });

        if (!response.ok) {
          throw new Error(`${response.status}: ${await response.text()}`);
        }

        stableId = await response.text();
      } catch (error) {
        console.error('Failed to fetch Statsig stable ID:', error);
      }
    }

    stableId ||= createUuid();

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
