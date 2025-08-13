// Function to fetch whether user has project validator permission or not.
export default async function fetchPermissions(): Promise<string[]> {
  const response = await fetch('/api/v1/users/current/permissions', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const json: {
    permissions: string[];
  } = await response.json(); 
  return json.permissions;
}
