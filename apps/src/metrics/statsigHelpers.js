import cookies from 'js-cookie';

import {getEnvironment, isProductionEnvironment, createUuid} from '../utils';

const STABLE_ID_KEY = 'statsig_stable_id';
const LOCAL_STORAGE_KEY = STABLE_ID_KEY.toUpperCase();
const COOKIE_OPTIONS = {
  path: '/',
  domain: '.code.org',
  sameSite: 'Lax',
  secure: true,
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
  let stableId =
    cookies.get(STABLE_ID_KEY) || localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!stableId) {
    stableId = createUuid();
  }

  if (consentAllowsStatsigCookie()) {
    cookies.set(STABLE_ID_KEY, stableId, COOKIE_OPTIONS);
    localStorage.setItem(LOCAL_STORAGE_KEY, stableId);
  } else {
    // Ensure any existing cookie is removed to satisfy OneTrust
    // (must pass same attributes used when setting the cookie)
    cookies.remove(STABLE_ID_KEY, {path: '/', domain: '.code.org'});
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  return stableId;
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
