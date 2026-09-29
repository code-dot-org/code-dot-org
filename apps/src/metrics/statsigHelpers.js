import cookies from 'js-cookie';

import {StatsigStableIdKey} from '@cdo/generated-scripts/sharedConstants';

import {getEnvironment, isProductionEnvironment, createUuid} from '../utils';

export function getUserID() {
  const user_id_element = document.querySelector('script[data-user-id]');
  return user_id_element ? user_id_element.dataset.userId : null;
}

export function getUserType() {
  const user_type_element = document.querySelector('script[data-user-type');
  return user_type_element ? user_type_element.dataset.userType : null;
}

/**
 * Returns the existing Statsig stable ID from cookies, or generates a new one.
 *
 * @returns {string} The existing stable ID or a newly generated UUID.
 */
export function findOrCreateStableId() {
  return cookies.get(StatsigStableIdKey) || createUuid();
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
