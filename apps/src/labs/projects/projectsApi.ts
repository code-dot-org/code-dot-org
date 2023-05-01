const rootUrl = '/projects/';

export async function getForLevel(levelId: string): Promise<Response> {
  return fetch(`${rootUrl}/for_level/${levelId}`);
}
