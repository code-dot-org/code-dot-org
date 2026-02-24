import HttpClient from '@cdo/apps/util/HttpClient';

// Function to fetch whether user has project validator permission or not.
export default async function fetchPermissions(): Promise<string[]> {
  const permissionsResponse = await HttpClient.fetchJson<{
    permissions: string[];
  }>('/api/v1/users/current/permissions');
  const {permissions} = permissionsResponse.value;
  return permissions;
}
