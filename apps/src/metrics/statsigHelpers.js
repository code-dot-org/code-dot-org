import cookies from 'js-cookie';

import {getEnvironment, isProductionEnvironment, createUuid} from '../utils';

const STABLE_ID_KEY = 'statsig_stable_id';
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
// Settings for waiting for OneTrust consent data to be available
const ONETRUST_CHECK_INTERVAL_MS = 100;
const ONETRUST_MAX_WAIT_MS = 1000;

export function getUserID() {
  const user_id_element = document.querySelector('script[data-user-id]');
  return user_id_element ? user_id_element.dataset.userId : null;
}

export function getUserType() {
  const user_type_element = document.querySelector('script[data-user-type');
  return user_type_element ? user_type_element.dataset.userType : null;
}

export function findOrCreateStableId() {
  let stableId = cookies.get(STABLE_ID_KEY);

  if (!stableId) {
    stableId = createUuid();
  }

  if (consentAllowsStatsigCookie()) {
    cookies.set(STABLE_ID_KEY, stableId, COOKIE_OPTIONS);
  } else {
    // Ensure any existing cookie is removed to satisfy OneTrust
    // (must pass same attributes used when setting the cookie)
    cookies.remove(STABLE_ID_KEY, {path: '/', domain: '.code.org'});
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
    // console.log(`Onetrust groups: ${rawString}`);
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

function shouldWaitForOnetrust() {
  if (typeof window === 'undefined') {
    return false;
  }
  // OneTrust scripts include a data-domain-script attribute; if it's present we expect consent data.
  return Boolean(document.querySelector('script[data-domain-script]'));
}

function hasOnetrustGroups() {
  if (typeof window === 'undefined') {
    return true;
  }
  return typeof window.OnetrustActiveGroups === 'string';
}

export function waitForOnetrustGroupsReady({
  timeoutMs = ONETRUST_MAX_WAIT_MS,
} = {}) {
  if (!shouldWaitForOnetrust()) {
    return Promise.resolve();
  }

  if (hasOnetrustGroups()) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    let resolved = false;

    const resolveOnce = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      cleanup();
      resolve();
    };

    const handleUpdate = () => {
      if (hasOnetrustGroups()) {
        resolveOnce();
      }
    };

    const checkInterval = window.setInterval(
      handleUpdate,
      ONETRUST_CHECK_INTERVAL_MS
    );
    const timeoutId = window.setTimeout(resolveOnce, timeoutMs);

    const cleanup = () => {
      document.removeEventListener('OneTrustGroupsUpdated', handleUpdate);
      window.clearInterval(checkInterval);
      window.clearTimeout(timeoutId);
    };

    document.addEventListener('OneTrustGroupsUpdated', handleUpdate);

    // Run an initial check in case the groups became available before listeners were bound.
    handleUpdate();
  });
}
