import HttpClient from '@cdo/apps/util/HttpClient';

import {PERMISSIONS} from '../constants';

// Function to fetch whether user has project validator permission or not.
export default async function fetchIsProjectValidator(): Promise<boolean> {
  const permissionsResponse = await HttpClient.fetchJson<{
    permissions: string[];
  }>('/api/v1/users/current/permissions');
  const {permissions} = permissionsResponse.value;

  return permissions.includes(PERMISSIONS.PROJECT_VALIDATOR) ? true : false;
}
