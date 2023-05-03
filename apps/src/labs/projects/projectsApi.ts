const rootUrl = '/projects/';

// Given a levelId, get the project identifier (channel id) for that level.
export async function getForLevel(levelId: string): Promise<Response> {
  return fetch(`${rootUrl}/for_level/${levelId}`);
}
