import cookies from 'js-cookie';

import {getEnvironment, isProductionEnvironment, createUuid} from '../utils';

export function getUserID() {
  const user_id_element = document.querySelector('script[data-user-id]');
  return user_id_element ? user_id_element.dataset.userId : null;
}

export function getUserType() {
  const user_type_element = document.querySelector('script[data-user-type');
  return user_type_element ? user_type_element.dataset.userType : null;
}

export function findOrCreateStableId() {
  const STABLE_ID_KEY = 'statsig_stable_id';
  let stableId = cookies.get(STABLE_ID_KEY);
  if (!stableId) {
    stableId = createUuid();
    cookies.set(STABLE_ID_KEY, stableId, {
      path: '/',
    });
  }
  return stableId;
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
